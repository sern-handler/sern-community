import { commandModule, CommandType } from "@sern/handler";
import { ownerIDs } from "#constants";
import { db } from "#db";
import { parseTimeInput, Timestamp } from "#utils";
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
        const parsedTime = parseTimeInput(newTime);
        if (typeof parsedTime === "string")
            return ctx.reply({
                content: parsedTime,
                ephemeral: true,
            });

        const startTime = new Date();

        let endTime: Date = add(startTime, parsedTime);
        if (endTime.getTime() - startTime.getTime() <= 0)
            return ctx.reply({
                content: "Please try again with a valid time.",
                ephemeral: true,
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
