import { commandModule, CommandType } from "@sern/handler";
import { ownerOnly, publish } from "#plugins";
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { db } from "../utils/db.js";
import { add } from "date-fns";
import { Timestamp } from "#utils";
import { ownerIDs } from "#constants";

export default commandModule({
    type: CommandType.Slash,
    description: "Start a giveaway involving users who react to the embed",
    plugins: [publish()],
    options: [
        {
            name: "item",
            description: "The item that will be given away",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "time",
            description: "The amount of time that the giveaway will be up",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    execute: async (ctx, { deps }) => {
        const item = ctx.options.getString("item");
        const timeLeftString = ctx.options.getString("time", true);

        let timeUnit1;
        let timeLeft1;
        let timeUnit2;
        let timeLeft2;

        const [part1, part2] = timeLeftString?.split("and");
        timeUnit1 = part1?.split(" ")[1];
        timeLeft1 = Number(part1?.split(" ")[0]);

        if (part2) {
            const timeLeftStringPart2 = part2.replace(part2.substring(0, 1), "");
            timeUnit2 = timeLeftStringPart2?.split(" ")[1];
            timeLeft2 = Number(timeLeftStringPart2?.split(" ")[0]);
        }

        const startTime = new Date();

        let endTime: Date;

        const secondNames = ["seconds", "second", "sec", "secs"];
        const minuteNames = ["minutes", "minute", "min", "mins"];
        const hourNames = ["hours", "hour", "hr", "hrs"];
        const dayNames = ["days", "day"];

        endTime = add(startTime, {
            seconds: secondNames.includes(timeUnit1!)
                ? timeLeft1
                : secondNames.includes(timeUnit2!)
                ? timeLeft2
                : 0,
            minutes: minuteNames.includes(timeUnit1!)
                ? timeLeft1
                : minuteNames.includes(timeUnit2!)
                ? timeLeft2
                : 0,
            hours: hourNames.includes(timeUnit1!)
                ? timeLeft1
                : hourNames.includes(timeUnit2!)
                ? timeLeft2
                : 0,
            days: dayNames.includes(timeUnit1!)
                ? timeLeft1
                : dayNames.includes(timeUnit2!)
                ? timeLeft2
                : 0,
        });

        const endTimeStamp: string = `<t:${Math.floor(endTime!.getTime() / 1000)}:f>`;
        const endTimeStamp2 = new Timestamp(endTime.getTime()).timestamp;

        let embed = new EmbedBuilder()
            .setTitle(`🥳 ${item} giveaway 🥳`)
            .setDescription("Click the button to enter the giveaway!")
            .addFields({
                name: "\u200b",
                value: `Hosted by: <@${ctx.userId}>
                Entries: 0
                Ends: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()} (${endTimeStamp})`,
            });

        await ctx
            .reply({
                embeds: [embed],
                components: [setupRows()],
            })
            .then((embedMessage) => {
                let giveawayEnded = false;

                db.prepare(`INSERT INTO giveaway_message(message_id, end_time, host_id) VALUES (?, ?, ?)`).run(
                    embedMessage.id,
                    endTime.getTime(),
                    ctx.userId
                );

                // deps["@sern/client"].on("interactionCreate", async (interaction) => {
                //     if (interaction.isButton()) {
                //         if (interaction.customId === "enter" || interaction.customId === "leave") {
                //             const messageId = interaction.message.id;
                //             console.log(`Message ID: ${messageId}`);
                //             const userId = interaction.user.id;

                //             const host = db
                //                 .prepare(
                //                     `SELECT host_id FROM giveaway_message WHERE message_id = ?`
                //                 )
                //                 .get(messageId);

                //             if (interaction.customId === "enter") {
                //                 // Prevent host from entering
                //                 // if (host && host.host_id === userId) {
                //                 //     await interaction.reply({ ephemeral: true, content: `You cannot enter the giveaway as the host!` });
                //                 //     return;
                //                 // }
                //                 // Check if already entered
                //                 const checkUser = db
                //                     .prepare(
                //                         `SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`
                //                     )
                //                     .get(messageId, userId);
                //                 if (checkUser.count === 0) {
                //                     db.prepare(
                //                         `INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`
                //                     ).run(messageId, Date.now(), userId);
                //                     await interaction.reply({
                //                         ephemeral: true,
                //                         content: `Giveaway entered!`,
                //                     });
                //                 } else {
                //                     await interaction.reply({
                //                         ephemeral: true,
                //                         content: `You are already entered!`,
                //                     });
                //                 }
                //             } else {
                //                 // Leave giveaway
                //                 const checkUser = db
                //                     .prepare(
                //                         `SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`
                //                     )
                //                     .get(messageId, userId);
                //                 if (checkUser.count === 1) {
                //                     db.prepare(
                //                         `DELETE FROM entries WHERE message_id = ? AND user_id = ?`
                //                     ).run(messageId, userId);
                //                     await interaction.reply({
                //                         ephemeral: true,
                //                         content: `Giveaway left`,
                //                     });
                //                 } else {
                //                     await interaction.reply({
                //                         ephemeral: true,
                //                         content: `You cannot leave a giveaway you were not entered in`,
                //                     });
                //                 }
                //             }

                //             // Get updated entry count
                //             const entryCount = db
                //                 .prepare(
                //                     `SELECT COUNT(*) as count FROM entries WHERE message_id = ?`
                //                 )
                //                 .get(messageId).count;

                //             // Edit embed
                //             const embed = EmbedBuilder.from(
                //                 interaction.message.embeds[0]
                //             ).spliceFields(0, 1, {
                //                 name: "\u200b",
                //                 value: `Hosted by: <@${host?.host_id ?? "unknown"}>
                //                             Entries: ${entryCount}
                //                             Ends: ${new Timestamp(
                //                                 Number(endTimeStamp2)
                //                             ).getRelativeTime()} (${endTimeStamp})`,
                //             });

                //             await interaction.message.edit({ embeds: [embed] });
                //         }

                //         if (interaction.customId === "edit" || interaction.customId === "end") {
                //             // if (!ownerIDs.includes(interaction.user.id)) {
                //             //     await interaction.reply({ ephemeral: true, content: `You do not have permission to edit or end this giveaway!` });
                //             //     return;
                //             //}
                //             if (interaction.customId === "edit") {
                //                 // Handle editing the giveaway
                //                 await interaction.reply({
                //                     ephemeral: true,
                //                     content: `Editing the giveaway is not implemented yet.`,
                //                 });
                //             } else if (interaction.customId === "end") {
                //                 // Handle ending the giveaway
                //                 if (giveawayEnded) {
                //                     await interaction.reply({
                //                         ephemeral: true,
                //                         content: `This giveaway has already ended!`,
                //                     });
                //                     return;
                //                 }
                //                 giveawayEnded = true;
                //                 clearTimeout(giveawayTimeout);
                //                 await interaction.reply({
                //                     ephemeral: true,
                //                     content: `Giveaway ended by <@${interaction.user.id}>`,
                //                 });
                //                 endGiveaway();
                //             }
                //         }
                //     }
                // });

                // test entries
                // db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 1, 1])
                // db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 2, 2])
                // db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 3, 3])
                // db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 4, 4])
                // db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 5, 5])

                let intervalTime = endTime.getTime() - startTime.getTime();

                function endGiveaway() {
                    const stmt = db
                        .prepare(`SELECT * FROM entries WHERE message_id = ?`)
                        .all(embedMessage.id);

                    const eligible = stmt; /*.filter(
                        (entry: { user_id: string }) =>
                            entry.user_id !== embedMessage.author.id &&
                            entry.user_id !== ctx.user.id
                    );*/

                    let winnerIndex = Math.floor(Math.random() * eligible.length);

                    if (eligible.length > 0 && eligible[winnerIndex].user_id !== ctx.userId) {
                        const winnerId = stmt[winnerIndex].user_id;

                        embedMessage.edit({
                            content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
                            embeds: [],
                            components: [discardRows()],
                        });
                        giveawayEnded = true;
                    } else if (
                        eligible.length > 1 &&
                        eligible[winnerIndex].user_id === ctx.userId
                    ) {
                        while (eligible[winnerIndex].user_id === ctx.userId) {
                            winnerIndex = Math.floor(Math.random() * eligible.length);
                        }
                        const winnerId = eligible[winnerIndex].user_id;

                        embedMessage.edit({
                            content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
                            embeds: [],
                            components: [discardRows()],
                        });
                        giveawayEnded = true;
                    } else if (
                        (eligible.length === 1 && eligible[winnerIndex].user_id === ctx.userId) ||
                        eligible.length === 0
                    ) {
                        embedMessage.edit({
                            content: `Couldn't determine a winner: Not enough eligible users. ${eligible.length} users entered`,
                            embeds: [],
                            components: [discardRows()],
                        });
                        giveawayEnded = true;
                    }

                    if (giveawayEnded) {
                        db.prepare(`DELETE FROM giveaway_message WHERE message_id = ?`).run(
                            embedMessage.id
                        );
                        db.prepare(`DELETE FROM entries WHERE message_id = ?`).run(embedMessage.id);
                    }
                }

                const giveawayTimeout = setTimeout(() => {
                    if (giveawayEnded) return;
                    endGiveaway()
                }, intervalTime);
            });
    },
});

function discardRows() {
    const discardGiveaway = new ButtonBuilder({
        customId: "discard",
        label: "Discard",
        style: ButtonStyle.Primary,
    });

    return new ActionRowBuilder<ButtonBuilder>().addComponents(discardGiveaway);
}

function setupRows() {
    const enterGiveaway = new ButtonBuilder({
        customId: "enter",
        label: "Enter Giveaway",
        style: ButtonStyle.Success,
    });
    const leaveGiveaway = new ButtonBuilder({
        customId: "leave",
        label: "Leave Giveaway",
        style: ButtonStyle.Danger,
    });
    const editGiveaway = new ButtonBuilder({
        customId: "edit",
        label: "Edit Giveaway",
        style: ButtonStyle.Primary,
    });
    const endGiveaway = new ButtonBuilder({
        customId: "end",
        label: "End Giveaway",
        style: ButtonStyle.Secondary,
    });

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        enterGiveaway,
        leaveGiveaway,
        editGiveaway,
        endGiveaway
    );
}
