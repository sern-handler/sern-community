import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionRemove',
    execute: async (reaction, deletedEntry) => {
        const deletedId = deletedEntry.id

        const message_id = db.prepare(`SELECT message_id FROM giveaway_message LIMIT 1`).get()

        if (reaction.emoji.name === '🎉' && reaction.message.id === message_id.message_id) {
            const stmt = db.prepare(`DELETE FROM entries WHERE user_id = ?`)
        
            stmt.run(deletedId)
        }
    }
})