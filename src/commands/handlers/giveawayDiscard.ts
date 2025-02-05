import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "discard",
    async execute(ctx) {
        // if (!ownerIDs.includes(ctx.user.id))
        //     return ctx.reply({
        //         ephemeral: true,
        //         content: `You cannot discard the giveaway because you are not one of the owners`,
        //     }

        db.prepare(`DELETE FROM giveaway_message WHERE message_id = ?`).run(ctx.message.id)
        db.prepare(`DELETE FROM entries WHERE message_id = ?`).run(ctx.message.id)

        ctx.message.reactions.removeAll()
    },
});
