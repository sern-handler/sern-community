import { eventModule, EventType } from "@sern/handler";
import type { Message } from "discord.js";
import { upload } from "#utils";

export default eventModule({
	type: EventType.Discord,
	name: "messageCreate",
	async execute(message: Message) {
		if (!message.guild || message.webhookId || message?.author?.bot) return;
		// ! 2 cases, 1 -> normal msg (common), 2 -> uploaded file (rare [free PR])

		const { content } = message;
		if (!content.includes("```")) return;
		const code = content.split(/```.*/gi)[1].split("```")[0].trim();

		if (code.split("\n").length < 10) return;

		const link = await upload(code);

		await message.reply({
			content: `${message.author} I have uploaded the code at ${link}\nPlease use bins when sharing code!`,
		});

		if (code.split("\n").length > 20) await message.delete();
	},
});
