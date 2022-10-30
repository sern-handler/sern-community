import { eventModule, EventType } from "@sern/handler";
import type { Message } from "discord.js";

export default eventModule({
	name: "messageCreate",
	type: EventType.Discord,
	async execute(message: Message) {
		if (message.author?.bot || message.webhookId) return;
		const regex = /w+h+a+t+(?:'s+| is+|s)? (?:.*)?b+o+f+a+/gim;

		if (message.content.match(regex)) {
			return message.reply("bofa deez nuts");
		}
	},
});
