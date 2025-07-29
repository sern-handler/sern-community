import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "leave",
    async execute(ctx) {
        const deletedId = ctx.user.id

        let left = false

        const message = db
            .prepare(`SELECT message_id FROM giveaway_message WHERE message_id = ?`)
            .get(ctx.message.id);

        const checkUser = db
                .prepare(
                    `SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`
                )
                .get(message.message_id, ctx.user.id);

        if (ctx.message.id === message.message_id && checkUser.count == 1) {
            db.prepare(`DELETE FROM entries WHERE message_id = ? AND user_id = ?`).run(
                message.message_id,
                deletedId
            );
            left = true
        }

        if (left) await ctx.reply({ ephemeral: true, content: `Giveaway left` });
        else await ctx.reply({ ephemeral: true, content: `You cannot leave a giveaway you were not entered in` });
    },
});
