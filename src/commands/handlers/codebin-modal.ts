import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { codebinrequestmodal } from "../../utils/codebin.js";

export default commandModule({
	type: CommandType.Modal,
	async execute(ctx) {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("sendMessage")
				.setLabel("Send messsage with URL")
				.setStyle(ButtonStyle.Primary)
		);
		const request = await codebinrequestmodal(`${process.env.PASTE_EE}`, ctx);
		const message = ctx.reply({
			content: `Your code has been uploaded correctly!\n Link: <${request.link}>`,
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
				i.editReply({
					content: `Here's the link to a code <@${ctx.member?.user.id}> has uploaded:\n${request.link}`,
				});
			}
		});
	},
});
