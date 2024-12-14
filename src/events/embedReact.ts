import { discordEvent } from "@sern/handler";
import { db } from "../utils/db.js"

export default discordEvent({
    name: 'messageReactionAdd',
    execute: async (reaction, potentialWinners) => {
        const startTime = reaction.message.createdTimestamp

        const messages = db.prepare(`SELECT * FROM giveaway_message`).all()

        messages.map((message: { message_id: string, host_id: string }) => {
            if (reaction.emoji.name === '🎉' && reaction.message.id === message.message_id && !potentialWinners.bot && message.host_id !== reaction.message.interaction?.user.id) {
                const checkUser = db.prepare(`SELECT COUNT(*) as count FROM entries WHERE message_id = ? AND user_id = ?`).get(message.message_id, potentialWinners.id);

                if (checkUser.count === 0) {
                    const stmt = db.prepare(`INSERT INTO entries(message_id, timestamp, user_id) VALUES (?, ?, ?)`).run([message.message_id, startTime, potentialWinners.id])
                }
            }
        })
    }
})