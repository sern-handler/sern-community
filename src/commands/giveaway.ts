import { commandModule, CommandType } from '@sern/handler';
import { ownerOnly, publish } from '#plugins';
import { ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { db } from '#db';
import { add } from 'date-fns';
import { Timestamp } from '#utils';

export default commandModule({
  type: CommandType.Slash,
  description: 'Start a giveaway involving users who react to the embed',
  plugins: [publish(), ownerOnly()],
  options: [
    {
      name: 'item',
      description: 'The item that will be given away',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'time',
      description: "Time format: DD:HH:MM:SS or just minutes ('30' for 30 minutes, '1:30:00:00' for 1 day 30 minutes)",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  execute: async (ctx, { deps }) => {
    const item = ctx.options.getString('item');
    const timeInput = ctx.options.getString('time', true);

    function parseTimeInput(input: string): { days: number; hours: number; minutes: number; seconds: number } | string {
      if (!input.includes(':')) {
        const minutes = parseInt(input);
        if (isNaN(minutes) || minutes <= 0) {
          return 'Invalid time format. Use a positive number for minutes or DD:HH:MM:SS format.';
        }
        return { days: 0, hours: 0, minutes, seconds: 0 };
      }
      const parts = input.split(':').map(part => parseInt(part));

      if (parts.some(part => isNaN(part) || part < 0)) {
        return 'Invalid time format. All time components must be non-negative numbers.';
      }

      let days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0;

      if (parts.length === 4) {
        // DD:HH:MM:SS
        [days, hours, minutes, seconds] = parts;
      } else if (parts.length === 3) {
        // HH:MM:SS (assume no days)
        [hours, minutes, seconds] = parts;
      } else if (parts.length === 2) {
        // MM:SS (assume no days or hours)
        [minutes, seconds] = parts;
      } else {
        return 'Invalid time format. Use DD:HH:MM:SS, HH:MM:SS, MM:SS, or just minutes.';
      }

      if (hours >= 24) return 'Hours must be less than 24.';
      if (minutes >= 60) return 'Minutes must be less than 60.';
      if (seconds >= 60) return 'Seconds must be less than 60.';

      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        return 'Giveaway duration must be greater than 0.';
      }

      return { days, hours, minutes, seconds };
    }

    let timeComponents;
    try {
        const parseResult = parseTimeInput(timeInput);
        if (typeof parseResult === 'string') {
          return ctx.reply({
            content: `❌ ${parseResult}`,
            ephemeral: true
          });
        }
      timeComponents = parseTimeInput(timeInput);
    } catch (error) {
      return ctx.reply({
        content: `❌ ${(error as Error).message}`,
        ephemeral: true
      });
    }

    const startTime = new Date();
    const endTime = add(startTime, timeComponents);

    const endTimeStamp = `<t:${Math.floor(endTime.getTime() / 1000)}:f>`;
    const endTimeStamp2 = new Timestamp(endTime.getTime()).timestamp;

    let embed = new EmbedBuilder()
      .setTitle(`🥳 ${item} giveaway 🥳`)
      .setDescription('Click the button to enter the giveaway!')
      .addFields({
        name: '\u200b',
        value: `Hosted by: <@${ctx.userId}>
            Entries: 0
            Ends: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()} (${endTimeStamp})`
      });

    await ctx
      .reply({
        embeds: [embed],
        components: [setupRows()]
      })
      .then(embedMessage => {
        let giveawayEnded = false;

        const startTimeStamp = new Timestamp(startTime.getTime()).timestamp;

        db.prepare(
          `INSERT INTO giveaway_message(message_id, start_timestamp, end_time, host_id, item) VALUES (?, ?, ?, ?, ?)`
        ).run(embedMessage.id, startTimeStamp, endTime.getTime(), ctx.userId, item);

        // test entries
        // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 1])
        // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 2])
        // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 3])
        // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 4])
        // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 5])

        function endGiveaway() {
          const giveawayData = db
            .prepare(`SELECT item FROM giveaway_message WHERE message_id = ?`)
            .get(embedMessage.id);
          const item = giveawayData?.item ?? 'Unknown item';

          const stmt = db.prepare(`SELECT * FROM entries WHERE message_id = ?`).all(embedMessage.id);

          const eligible = stmt.filter(
            (entry: { user_id: string }) => entry.user_id !== embedMessage.author.id && entry.user_id !== ctx.user.id
          );

          let winnerIndex = Math.floor(Math.random() * eligible.length);

          if (eligible.length > 0 && eligible[winnerIndex].user_id !== ctx.userId) {
            const winnerId = stmt[winnerIndex].user_id;

            embedMessage.edit({
              content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
              embeds: [],
              components: [discardRows()]
            });
            giveawayEnded = true;
          } else if (eligible.length > 1 && eligible[winnerIndex].user_id === ctx.userId) {
            while (eligible[winnerIndex].user_id === ctx.userId) {
              winnerIndex = Math.floor(Math.random() * eligible.length);
            }
            const winnerId = eligible[winnerIndex].user_id;

            embedMessage.edit({
              content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
              embeds: [],
              components: [discardRows()]
            });
            giveawayEnded = true;
          } else if ((eligible.length === 1 && eligible[winnerIndex].user_id === ctx.userId) || eligible.length === 0) {
            embedMessage.edit({
              content: `Couldn't determine a winner: Not enough eligible users. ${eligible.length} users entered`,
              embeds: [],
              components: [discardRows()]
            });
            giveawayEnded = true;
          }
        }

        let interval = setInterval(() => {
          const giveaway = db
            .prepare(`SELECT end_time, ended FROM giveaway_message WHERE message_id = ?`)
            .get(embedMessage.id);
          if (!giveaway || giveaway.ended) {
            clearInterval(interval);
            return;
          }
          const now = Date.now();
          if (now >= giveaway.end_time) {
            endGiveaway();
            db.prepare(`DELETE FROM giveaway_message WHERE message_id = ?`).run(embedMessage.id);
            db.prepare(`DELETE FROM entries WHERE message_id = ?`).run(embedMessage.id);
            clearInterval(interval);
          }
        }, 1000);
      });
  }
});

export function discardRows() {
  const discardGiveaway = new ButtonBuilder({
    customId: 'discard',
    label: 'Discard',
    style: ButtonStyle.Primary
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(discardGiveaway);
}

export function setupRows() {
  const enterGiveaway = new ButtonBuilder({
    customId: 'enter',
    label: 'Enter Giveaway',
    style: ButtonStyle.Success
  });
  const leaveGiveaway = new ButtonBuilder({
    customId: 'leave',
    label: 'Leave Giveaway',
    style: ButtonStyle.Danger
  });
  const editGiveaway = new ButtonBuilder({
    customId: 'edit',
    label: 'Edit Giveaway',
    style: ButtonStyle.Primary
  });
  const endGiveaway = new ButtonBuilder({
    customId: 'end',
    label: 'End Giveaway',
    style: ButtonStyle.Secondary
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(enterGiveaway, leaveGiveaway, editGiveaway, endGiveaway);
}
