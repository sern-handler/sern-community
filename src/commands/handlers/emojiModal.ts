import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";

export default commandModule({
	type: CommandType.Modal,
	async execute(ctx) {
		const emojiURL = ctx.message!.embeds[0].image?.url;
		if (!emojiURL)
			return ctx.reply({
				content: "Uh something bad happened, I couldn't get the emoji!",
				ephemeral: true,
			});
		const name = ctx.fields.getTextInputValue("emoji/name");

		const emoji = await ctx.guild?.emojis
			.create({
				attachment: emojiURL,
				name,
				reason: `Accepted by ${ctx.user.tag}`,
			})
			.catch((e) => {
				ctx.reply({
					content: e.message,
					ephemeral: true,
				});
				return null;
			});

		if (!emoji) return;

		await ctx.deferUpdate();

		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				ctx.message!.components[0].components.map((c) =>
					new ButtonBuilder(c.data).setDisabled()
				)
			),
		];

		const embed = new EmbedBuilder(ctx.message?.embeds[0]?.data) //
			.setFields(
				{
					name: "Emoji details",
					value: `\` - \` Name: ${emoji?.name}\n\` - \` Animated: ${
						emoji?.animated ? "Yes" : "Nope"
					}\n\` - \` Emoji: ${emoji}\n\` - \` Raw: \`${emoji.toString()}\``,
				},
				{
					name: "Status",
					value: `Accepted by ${ctx.user}`,
				}
			)
			.setColor("Green")
			.setFooter({
				text: `GG ${ctx.message?.embeds[0].author?.name}`,
			})
			.setTimestamp();

		await ctx.message?.edit({
			content: null,
			embeds: [embed],
			components,
			files: [],
		});
	},
});
