import { eventModule, EventType } from "@sern/handler";
import type { Message } from "discord.js";
const wait = (await import("util")).promisify(setTimeout);

export default eventModule({
    name: "messageCreate",
    type: EventType.Discord,
    async execute(message: Message) {
        if (message.author?.bot || message.webhookId) return;
        const regex = /(?:w+h+a+t+)?(?:'s+| is+|s+|’s+)? ?(?:.*)?b+o+f+a+/gim;
        const rand = Math.random() * 10000;
        if (message.content.match(regex)) {
            await wait(rand);
            return message.reply("bofa deez nuts");
        }
    },
});
