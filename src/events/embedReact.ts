import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionAdd',
    execute: async (reaction, potentialWinners) => {
        const startTime = reaction.message.createdTimestamp

        const stmt = db.prepare(`INSERT INTO entrees(timestamp, user_id) VALUES (?, ?)`)
        
        if (potentialWinners.bot === false) {
            stmt.run([startTime, potentialWinners.id])
        }
    }
})
