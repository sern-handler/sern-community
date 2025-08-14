import { commandModule, CommandType } from "@sern/handler";
import { ownerIDs } from "#constants";
import { db } from "#db";
import { Timestamp } from "#utils";
import { add } from "date-fns";
import { EmbedBuilder } from "discord.js";

export default commandModule({
    type: CommandType.Modal,
    name: "giveawayEditModal",
    async execute(ctx) {
        if (!ownerIDs.includes(ctx.user.id))
            return ctx.reply({
                ephemeral: true,
                content: `You cannot edit the giveaway because you are not one of the owners`,
            });

        const newItem = ctx.fields.getTextInputValue("item");
        const newTime = ctx.fields.getTextInputValue("time");

        let timeUnit1;
        let timeLeft1;
        let timeUnit2;
        let timeLeft2;

        const [part1, part2] = newTime?.split("and");
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

        db.prepare(`UPDATE giveaway_message SET item = ? WHERE message_id = ?`).run(
            newItem,
            ctx.message?.id
        );
        db.prepare(`UPDATE giveaway_message SET end_time = ? WHERE message_id = ?`).run(
            endTime.getTime(),
            ctx.message?.id
        );

        await ctx.reply({ content: "Giveaway updated!", ephemeral: true });

        const message = await ctx.channel?.messages.fetch(ctx.message!.id);
        const giveaway = db
            .prepare(`SELECT item, end_time FROM giveaway_message WHERE message_id = ?`)
            .get(ctx.message?.id);

        const entryCount = db
            .prepare(`SELECT COUNT(*) as count FROM entries WHERE message_id = ?`)
            .get(ctx.message!.id).count;

        const newEmbed = EmbedBuilder.from(message!.embeds[0])
            .setTitle(`🥳 ${giveaway.item} giveaway 🥳`)
            .spliceFields(0, 1, {
                name: "\u200b",
                value: `Hosted by: <@${
                    message!.interaction?.user.id
                }>\nEntries: ${entryCount}\nEnds: ${new Timestamp(
                    Number(endTimeStamp2)
                ).getRelativeTime()} (${endTimeStamp})`,
            });

        await message!.edit({ embeds: [newEmbed] });
    },
});
