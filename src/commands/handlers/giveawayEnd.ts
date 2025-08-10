import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";
import { ownerIDs } from "#constants";
import { discardRows } from "../giveaway.js";

export default commandModule({
    type: CommandType.Button,
    name: "end",
    async execute(ctx) {
        if (!ownerIDs.includes(ctx.user.id))
            return ctx.reply({
                ephemeral: true,
                content: `You cannot end the giveaway because you are not one of the owners`,
            });

        const message = db
            .prepare(`SELECT * FROM giveaway_message WHERE message_id = ?`)
            .get(ctx.message.id);

         if (Date.now() > message.end_time) {
            await ctx.reply({
                ephemeral: true,
                content: `This giveaway has already ended!`,
            });
            return;
        }
        await ctx.reply({
            ephemeral: true,
            content: `Giveaway ended by <@${ctx.user.id}>`,
        });

        let giveawayEnded = false
        let item = message.item
        
        const stmt = db
            .prepare(`SELECT * FROM entries WHERE message_id = ?`)
            .all(ctx.message.id);

        const eligible = stmt.filter(
            (entry: { user_id: string }) =>
                entry.user_id !== ctx.message.author.id &&
                entry.user_id !== ctx.user.id
        );

        let winnerIndex = Math.floor(Math.random() * eligible.length);

        if (eligible.length > 0 && eligible[winnerIndex].user_id !== ctx.user.id) {
            const winnerId = stmt[winnerIndex].user_id;

            ctx.message.edit({
                content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
                embeds: [],
                components: [discardRows()],
            });
            giveawayEnded = true;
        } else if (
            eligible.length > 1 &&
            eligible[winnerIndex].user_id === ctx.user.id
        ) {
            while (eligible[winnerIndex].user_id === ctx.user.id) {
                winnerIndex = Math.floor(Math.random() * eligible.length);
            }
            const winnerId = eligible[winnerIndex].user_id;

            ctx.message.edit({
                content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${eligible.length} users entered`,
                embeds: [],
                components: [discardRows()],
            });
            giveawayEnded = true;
        } else if (
            (eligible.length === 1 && eligible[winnerIndex].user_id === ctx.user.id) ||
            eligible.length === 0
        ) {
            ctx.message.edit({
                content: `Couldn't determine a winner: Not enough eligible users. ${eligible.length} users entered`,
                embeds: [],
                components: [discardRows()],
            });
            giveawayEnded = true;
        }

        if (giveawayEnded) {
            db.prepare(`UPDATE giveaway_message SET ended = 1 WHERE message_id = ?`).run(ctx.message.id)
        }
    },
});
