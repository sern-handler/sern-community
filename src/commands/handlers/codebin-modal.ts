import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import * as sourcebin from 'sourcebin';

export default commandModule({
	type: CommandType.Modal,
	async execute(ctx) {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("sendMessage")
				.setLabel("Send messsage with URL")
				.setStyle(ButtonStyle.Primary)
		);
		const request = await sourcebin.create({title: `Bin by ${ctx.user.username}`, files: [
			{
				content: ctx.fields.getTextInputValue("codeInput")
			}
		]})
		const message = ctx.reply({
			content: `Your code has been uploaded correctly!\n Link: <https://srcb.in/${request.key}>`,
			ephemeral: true,
			fetchReply: true,
			components: [row],
		});
		const collector = (await message).createMessageComponentCollector({
			time: 20000,
			max: 1,
		});
		collector.on("collect", async (i) => {
			await i.deferReply();
			if (i.customId === "sendMessage") {
				await i.editReply({
					content: `Here's the link to a code <@${ctx.member?.user.id}> has uploaded:\n<https://srcb.in/${request.key}>`,
				});
			}
		});
	},
});
