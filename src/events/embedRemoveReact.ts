import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionRemove',
    execute: async (reaction, deletedEntry) => {
        const deletedId = deletedEntry.id

        const message = db.prepare(`SELECT message_id FROM giveaway_message WHERE message_id = ?`).get(reaction.message.id)

        if (reaction.emoji.name === '🎉' && reaction.message.id === message.message_id) {
            db.prepare(`DELETE FROM entries WHERE message_id = ? AND user_id = ?`).run(message.message_id, deletedId)
        }
    }
})