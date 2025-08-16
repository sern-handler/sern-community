import { commandModule, CommandType } from "@sern/handler";
import { db } from "#db";
import { EmbedBuilder } from "discord.js";
import { Timestamp } from "#utils";

export default commandModule({
    type: CommandType.Button,
    name: "enter",
    async execute(ctx) {
        const messages = db.prepare(`SELECT * FROM giveaway_message`).all();

        messages.map(async (message: { message_id: string; end_time: number; host_id: string }) => {
            if (ctx.message.id === message.message_id && !ctx.user.bot) {
                const host = db
                    .prepare(`SELECT host_id FROM giveaway_message WHERE message_id = ?`)
                    .get(message.message_id);
                if (host && host.host_id === ctx.user.id) {
                    await ctx.reply({
                        ephemeral: true,
                        content: `You cannot enter the giveaway as the host!`,
                    });
                    return;
                }

                const checkUser = db
                    .prepare(
                        `SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`
                    )
                    .get(message.message_id, ctx.user.id);

                if (checkUser.count === 0) {
                    db.prepare(`INSERT INTO entries(message_id, user_id) VALUES (?, ?)`).run([
                        message.message_id,
                        ctx.user.id,
                    ]);
                    await ctx.reply({ ephemeral: true, content: `Giveaway entered!` });
                } else await ctx.reply({ ephemeral: true, content: `You are already entered!` });

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
            }
        });
    },
});
