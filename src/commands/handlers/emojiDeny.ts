import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";

export default commandModule({
	type: CommandType.Button,
	name: "emoji/deny",
	async execute(ctx) {
		if (!ownerIDs.includes(ctx.user.id))
			return ctx.reply({
				ephemeral: true,
				content: `You really thought the devs would allow you to deny the emoji?`,
			});

		await ctx.deferUpdate();

		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				ctx.message!.components[0].components.map((c) =>
					new ButtonBuilder(c.data).setDisabled()
				)
			),
		];

		const embed = new EmbedBuilder(ctx.message?.embeds[0]?.data) //
			.setFields(ctx.message!.embeds[0].fields[0], {
				name: "Status",
				value:
					`Denied by ${ctx.user}` +
					"\nThank you but we are not interested in this at the moment!",
			})
			.setColor("Red")
			.setTimestamp();

		await ctx.message?.edit({
			content: null,
			embeds: [embed],
			components,
			files: [],
		});
	},
});
