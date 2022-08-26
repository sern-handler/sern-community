import { eventModule, EventType } from "@sern/handler";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Message,
} from "discord.js";
import { createRequire } from "module";
import { FuzzyMatcher } from "../FuzzyMatcher.js";
import type { TagData, TagMessage } from "../types/index.js";
const require = createRequire(import.meta.url);
const file: TagData[] = require(`${process.cwd()}/tags.json`);

export default eventModule({
	type: EventType.Discord,
	name: "messageCreate",
	async execute(message: Message) {
		if (message.webhookId || message.author?.bot) return;
		if (
			message.client.data &&
			(message.client.data as { inCooldown: boolean }).inCooldown
		)
			return;
		const fuzz = new FuzzyMatcher(message, file);
		const data = fuzz.fuzzyMatch();
		if (!data) return;
		const { tag, confidence } = data;
		if (confidence <= 0.5) return;
		const mention = fuzz.mentionedUser;
		const text = mention ? `**Tag suggestion for:** ${mention}\n\n` : ``;
		const button = new ButtonBuilder()
			.setLabel("Click here to Jump to message")
			.setURL(message.url)
			.setStyle(ButtonStyle.Link);

		const deleteButton = new ButtonBuilder()
			.setLabel("Didn't help? False Trigger?")
			.setStyle(ButtonStyle.Danger)
			.setCustomId("@falseTrigger");

		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
			button,
			deleteButton,
		]);
		const embed = new EmbedBuilder()
			.setDescription(tag.content.trim())
			.setFooter({
				text: `${message.author.tag} | Confidence: ${(confidence * 100).toFixed(
					2
				)}%`,
				iconURL: message.author.displayAvatarURL(),
			})
			.setColor("Random")
			.setTimestamp();

		message.client.data = {
			inCooldown: true,
		};

		const msg = await message.channel.send({
			content: text,
			embeds: [embed],
			components: [row],
		});

		(msg as TagMessage).tagTriggerId = message.author.id;

		setTimeout(() => {
			message.client.data = {
				inCooldown: false,
			};
		}, 30_000);
	},
});
