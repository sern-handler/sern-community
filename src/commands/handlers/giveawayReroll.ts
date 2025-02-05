import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "reroll",
    async execute(ctx) {
        // if (!ownerIDs.includes(ctx.user.id))
        //     return ctx.reply({
        //         ephemeral: true,
        //         content: `You cannot reroll the giveaway because you are not one of the owners`,
        //     }

        console.log(ctx.message.id)
        const stmt = db.prepare(`SELECT * FROM entries WHERE message_id = ?`).all(ctx.message.id)
        
        if (stmt.length > 0) {
            let winnerIndex = Math.floor(Math.random() * stmt.length)
            const winnerId = stmt[winnerIndex].user_id

            await ctx.reply({content: `Congratulations <@${winnerId}> on winning the giveaway! ${stmt.length} users entered`})
        }
        else {
            await ctx.reply({content: `You cannot reroll because no one entered the giveaway!`})
        }
    },
});
