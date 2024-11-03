import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionRemove',
    execute: async (reaction, deletedEntry) => {
        const deletedId = deletedEntry.id

        if (reaction.emoji.name === '🎉') {
            const stmt = db.prepare(`DELETE FROM entrees WHERE user_id = ?`)
        
            stmt.run(deletedId)
        }
    }
})