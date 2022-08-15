import { eventModule, EventType } from "@sern/handler";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Message,
} from "discord.js";
import type { TagData } from "../commands/handlers/tagCreate";
import { findBestMatch } from "string-similarity";
const file: TagData[] = require(`${process.cwd()}/tags.json`);

export default eventModule({
	type: EventType.Discord,
	name: "messageCreate",
	async execute(message: Message) {
		if (message.webhookId || message.author?.bot) return;
		const keywords = file.flatMap((t) => t.keywords);
		const matches = findBestMatch(
			message.cleanContent.toLowerCase() ?? message.content.toLowerCase(),
			keywords
		);

		if (matches.bestMatch.rating < 0.7) return;
		const tag = file.find((t) => t.keywords.includes(matches.bestMatch.target));
		if (!tag) return;
		const mention = message.mentions.users.first();
		const text = mention ? `**Tag suggestion for:** ${mention}\n\n` : ``;
		const button = new ButtonBuilder()
			.setLabel("Click here to Jump to message")
			.setURL(message.url)
			.setStyle(ButtonStyle.Link);
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([button]);
		const embed = new EmbedBuilder()
			.setDescription(tag.content.trim())
			.setFooter({
				text: `Triggered by ${message.author.tag}`,
				iconURL: message.author.displayAvatarURL(),
			})
			.setColor("Random")
			.setTimestamp();
		return message.channel.send({
			content: text,
			embeds: [embed],
			components: [row],
		});
	},
});
