import { commandModule, CommandType } from "@sern/handler";
import { db } from "#db";
import { Timestamp } from "#utils";
import { EmbedBuilder } from "discord.js";

export default commandModule({
    type: CommandType.Button,
    name: "leave",
    async execute(ctx) {
        const deletedId = ctx.user.id;

        const message = db
            .prepare(`SELECT * FROM giveaway_message WHERE message_id = ?`)
            .get(ctx.message.id);

        const host = db
            .prepare(`SELECT host_id FROM giveaway_message WHERE message_id = ?`)
            .get(message.message_id);

        const checkUser = db
            .prepare(`SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`)
            .get(message.message_id, ctx.user.id);

        if (ctx.message.id === message.message_id && checkUser.count == 1) {
            db.prepare(`DELETE FROM entries WHERE message_id = ? AND user_id = ?`).run(
                message.message_id,
                deletedId
            );
            await ctx.reply({ ephemeral: true, content: `Giveaway left` });
        } else
            await ctx.reply({
                ephemeral: true,
                content: `You cannot leave a giveaway you were not entered in`,
            });

        const entryCount = db
            .prepare(`SELECT COUNT(*) as count FROM entries WHERE message_id = ?`)
            .get(message.message_id).count;

        const endTime = message.end_time;

        const endTimeStamp: string = `<t:${Math.floor(endTime! / 1000)}:f>`;
        const endTimeStamp2 = new Timestamp(endTime).timestamp;

        const embed = EmbedBuilder.from(ctx.message.embeds[0]).spliceFields(0, 1, {
            name: "\u200b",
            value: `Hosted by: <@${host?.host_id ?? "unknown"}>
                        Entries: ${entryCount}
                        Ends: ${new Timestamp(
                            Number(endTimeStamp2)
                        ).getRelativeTime()} (${endTimeStamp})`,
        });

        await ctx.message.edit({ embeds: [embed] });
    },
});
