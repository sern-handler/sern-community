import { commandModule, CommandType, Context } from "@sern/handler";
import axios from "axios";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { publish } from "../plugins/publish.js";
import { codebinrequest, codebinrequestmodal } from "../utils/codebin.js";
export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
	description: "Publish code to a bin",
	options: [
		{
			name: "file",
			description: "The file to upload.",
			type: ApplicationCommandOptionType.Attachment,
			required: false,
		},
	],
	execute: async (ctx: Context, [type, options]) => {
		let file;
		try {
			file = options.getAttachment("file", true);
		} catch (error) {}
		if (!file) {
			const modal = new ModalBuilder()
				.setCustomId("codebin-modal")
				.setTitle("Upload Code to paste.ee");
			const favoriteColorInput = new TextInputBuilder()
				.setCustomId("codeInput")
				.setLabel("Paste your code here (up to 4000 characters)")
				.setStyle(TextInputStyle.Paragraph);
			const firstActionRow =
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					favoriteColorInput
				);
			modal.addComponents(firstActionRow);
			ctx.interaction.showModal(modal);
		} else {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("sendMessage")
					.setLabel("Send messsage with URL")
					.setStyle(ButtonStyle.Primary)
			);
			const request = await codebinrequest(
				`${process.env.PASTE_EE}`,
				file,
				ctx
			);
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
						content: `Here's the link to a code <@${ctx.member?.user?.id}> has uploaded:\n${request.link}`,
					});
				}
			});
		}
	},
});
