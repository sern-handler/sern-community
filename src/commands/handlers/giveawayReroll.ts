import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "reroll",
    async execute(ctx) {
        if (!ownerIDs.includes(ctx.user.id))
            return ctx.reply({
                ephemeral: true,
                content: `You cannot reroll the giveaway because you are not one of the owners`,
            })

        const stmt = db.prepare(`SELECT * FROM entries WHERE message_id = ?`).all(ctx.message.id)
        
        const eligible = stmt.filter((entry: { user_id: string; }) => entry.user_id !== ctx.message.author.id);

        if (eligible.length === 0) {
            throw new Error("No eligible users to select as winner.");
        }

        const winnerIndex = Math.floor(Math.random() * eligible.length);
        const winner = eligible[winnerIndex];
        const winnerId = stmt[winnerIndex].user_id

        await ctx.reply({content: `Congratulations <@${winnerId}> on winning the giveaway! ${stmt.length} users entered`})
    },
});
