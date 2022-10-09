import { commandModule, CommandType, Context } from "@sern/handler";
import * as sourcebin from 'sourcebin';
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
import axios from "axios";
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
			await ctx.interaction.deferReply({ephemeral: true})
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("sendMessage")
					.setLabel("Send messsage with URL")
					.setStyle(ButtonStyle.Primary)
			);
			const getURL = await axios.get(`${file.url}`).then((res) => res.data);
			const request = await sourcebin.create({title: `Bin by ${ctx.user.username}`, files: [
				{
					content: getURL
				}
			]})
			const message = await ctx.interaction.editReply({
				content: `Your code has been uploaded correctly!\n Link: <https://srcb.in/${request.key}>`,
				components: [row],
			});
			const collector = message.createMessageComponentCollector({
				time: 20000,
				max: 1,
			});
			collector.on("collect", async (i) => {
				await i.deferReply();
				if (i.customId === "sendMessage") {
					await i.editReply({
						content: `Here's the link to a code <@${ctx.member?.user?.id}> has uploaded:\n<https://srcb.in/${request.key}>`,
					});
				}
			});
		}
	},
});
