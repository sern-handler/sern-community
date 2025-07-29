import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "enter",
    async execute(ctx) {
        const startTime = ctx.message.createdTimestamp;

        const messages = db.prepare(`SELECT * FROM giveaway_message`).all();

        let entered = false

        messages.map((message: { message_id: string; host_id: string }) => {
            if (ctx.message.id === message.message_id &&
                !ctx.user.bot &&
                message.host_id !== ctx.user.id
            ) {
                const checkUser = db
                    .prepare(
                        `SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`
                    )
                    .get(message.message_id, ctx.user.id);

                if (checkUser.count === 0) {
                    db.prepare(
                        `INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`
                    ).run([message.message_id, startTime, ctx.user.id]);

                    entered = true
                }
            }
        });
        if (entered) await ctx.reply({ ephemeral: true, content: `Giveaway entered!` });
        else await ctx.reply({ ephemeral: true, content: `You cannot enter the giveaway as the host!` });
    },
});
