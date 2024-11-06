import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionAdd',
    execute: async (reaction, potentialWinners) => {
        const startTime = reaction.message.createdTimestamp

        const message_id = db.prepare(`SELECT message_id FROM giveaway_message LIMIT 1`).get()

        if (reaction.emoji.name === '🎉' && reaction.message.id === message_id.message_id) {
            const stmt = db.prepare(`INSERT INTO entries(timestamp, user_id) VALUES (?, ?)`)
        
            if (potentialWinners.bot === false) {
                stmt.run([startTime, potentialWinners.id])
            }
        }
    }
})