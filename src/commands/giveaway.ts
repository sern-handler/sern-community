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
            autocomplete: true,
            command: {
                async execute(ctx) {
                    const focus = ctx.options.getFocused();
                    const timeUnits = [
                        "seconds", "second", "sec", "secs",
                        "minutes", "minute", "min", "mins",
                        "hours", "hour", "hr", "hrs",
                        "days", "day",
                    ];

                    if (!focus) return ctx.respond([]);

                    const andUnitMatch = focus.match(/and\s*(\d+)\s*(\w*)$/i);
                    if (andUnitMatch) {
                        const num = andUnitMatch[1];
                        const partialUnit = andUnitMatch[2];
                        const filtered = timeUnits.filter(unit =>
                            unit.toLowerCase().startsWith(partialUnit.toLowerCase())
                        );
                        return ctx.respond(
                            filtered.map(unit => ({
                                name: `${focus}${unit.slice(partialUnit.length)}`,
                                value: `${focus}${unit.slice(partialUnit.length)}`,
                            }))
                        );
                    }

                    const andMatch = focus.match(/and\s*(\d+)\s*$/i);
                    if (andMatch) {
                        const num = andMatch[1];
                        return ctx.respond(
                            timeUnits.map(unit => ({
                                name: `${focus}${unit}`,
                                value: `${focus}${unit}`,
                            }))
                        );
                    }

                    if (/^\d+\s*$/.test(focus)) {
                        return ctx.respond(
                            timeUnits.map(unit => ({
                                name: `${focus}${unit}`,
                                value: `${focus}${unit}`,
                            }))
                        );
                    }

                    const match = focus.match(/^(\d+)\s*(.*)$/);
                    if (match) {
                        const [, num, partialUnit] = match;
                        const filtered = timeUnits.filter(unit =>
                            unit.toLowerCase().startsWith(partialUnit.toLowerCase())
                        );
                        let suggestions = filtered.map(unit => ({
                            name: `${num} ${unit}`,
                            value: `${num} ${unit}`,
                        }));

                        if (filtered.length === 1 && partialUnit.length > 0 && filtered[0] === partialUnit.toLowerCase()) {
                            suggestions.push({
                                name: `${num} ${filtered[0]} and `,
                                value: `${num} ${filtered[0]} and `,
                            });
                        } else if (filtered.length === 1 && partialUnit.length > 0 && filtered[0].startsWith(partialUnit.toLowerCase())) {
                            suggestions.push({
                                name: `${num} ${filtered[0]} and `,
                                value: `${num} ${filtered[0]} and `,
                            });
                        }

                        return ctx.respond(suggestions);
                    }

                    const filtered = timeUnits.filter(unit =>
                        unit.toLowerCase().includes(focus.toLowerCase())
                    );
                    return ctx.respond(
                        filtered.map(unit => ({
                            name: unit,
                            value: unit,
                        }))
                    );
                }
            }
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

                const startTimeStamp = new Timestamp(startTime.getTime()).timestamp

                db.prepare(`INSERT INTO giveaway_message(message_id, start_timestamp, end_time, host_id, item) VALUES (?, ?, ?, ?, ?)`).run(
                    embedMessage.id,
                    startTimeStamp,
                    endTime.getTime(),
                    ctx.userId,
                    item
                );

                // test entries
                // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 1])
                // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 2])
                // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 3])
                // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 4])
                // db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?, ?)`).run([embedMessage.id, 5])

                let intervalTime = endTime.getTime() - startTime.getTime();

                function endGiveaway() {
                    const giveawayData = db.prepare(`SELECT item FROM giveaway_message WHERE message_id = ?`).get(embedMessage.id);
                    const item = giveawayData?.item ?? "Unknown item";

                    const stmt = db
                        .prepare(`SELECT * FROM entries WHERE message_id = ?`)
                        .all(embedMessage.id);

                    const eligible = stmt /*.filter(
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
                }

                let interval = setInterval(() => {
                    const giveaway = db.prepare(`SELECT end_time, ended FROM giveaway_message WHERE message_id = ?`).get(embedMessage.id);
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
    },
});

export function discardRows() {
    const discardGiveaway = new ButtonBuilder({
        customId: "discard",
        label: "Discard",
        style: ButtonStyle.Primary,
    });

    return new ActionRowBuilder<ButtonBuilder>().addComponents(discardGiveaway);
}

export function setupRows() {
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
