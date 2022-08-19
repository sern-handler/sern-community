import { commandModule, CommandType } from "@sern/handler";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { existsSync, writeFileSync } from "fs";
import { ownerOnly } from "../plugins/ownerOnly";
import { publish } from "../plugins/publish";
import type { TagData } from "../types";
export default commandModule({
	type: CommandType.Slash,
	plugins: [publish(), ownerOnly()],
	options: [
		{
			name: "create",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Create a new tag",
		},
		{
			name: "edit",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Edit an existing tag",
			options: [
				{
					name: "tag",
					description: "The tag to edit",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true,
					command: {
						onEvent: [],
						execute(ctx) {
							const filePath = `./tags.json`;
							const focus = ctx.options.getFocused();
							if (!existsSync(filePath)) {
								return ctx.respond([{ name: "No tags found", value: "" }]);
							} else {
								const file: TagData[] = require(`${process.cwd()}/tags.json`);
								const tags = file.map((t) => t.name);
								return ctx.respond(
									tags
										.filter((t) =>
											focus.length
												? t.toLowerCase().includes(focus.toLowerCase())
												: true
										)
										.map((t) => ({ name: t, value: t }))
								);
							}
						},
					},
				},
			],
		},
		{
			name: "delete",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Delete an existing tag",
			options: [
				{
					name: "tag",
					description: "The tag to delete",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true,
					command: {
						onEvent: [],
						execute(ctx) {
							const filePath = `./tags.json`;
							const focus = ctx.options.getFocused();
							if (!existsSync(filePath)) {
								return ctx.respond([{ name: "No tags found", value: "" }]);
							} else {
								const file: TagData[] = require(`${process.cwd()}/tags.json`);
								const tags = file.map((t) => t.name);
								return ctx.respond(
									tags
										.filter((t) =>
											focus.length
												? t.toLowerCase().includes(focus.toLowerCase())
												: true
										)
										.map((t) => ({ name: t, value: t }))
								);
							}
						},
					},
				},
			],
		},
	],
	execute: async (context, args) => {
		const [, options] = args;
		const subcmd = options.getSubcommand();

		const file: TagData[] = require(`${process.cwd()}/tags.json`);

		if (subcmd === "create") {
			const modal = new ModalBuilder()
				.setTitle("Tag Creation")
				.setCustomId("@sern/tag/create");

			const tagName = new TextInputBuilder()
				.setCustomId("tag-name")
				.setLabel("Tag Name")
				.setRequired()
				.setPlaceholder("Name of Tag")
				.setMinLength(3)
				.setMaxLength(32)
				.setStyle(TextInputStyle.Short);

			const tagContent = new TextInputBuilder()
				.setCustomId("tag-content")
				.setLabel("Tag Content")
				.setRequired()
				.setPlaceholder("Content of Tag")
				.setMinLength(3)
				.setMaxLength(1900)
				.setStyle(TextInputStyle.Paragraph);

			const keywords = new TextInputBuilder()
				.setCustomId("tag-keywords")
				.setLabel("Tag Keywords")
				.setPlaceholder("Keywords for Tag, separated by comma")
				.setMaxLength(200)
				.setRequired(false)
				.setStyle(TextInputStyle.Short);

			const rows = [tagName, tagContent, keywords].map((r) =>
				new ActionRowBuilder<TextInputBuilder>().addComponents(r)
			);
			modal.addComponents(rows);

			return context.interaction.showModal(modal);
		}

		if (subcmd === "edit") {
			const tag = options.getString("tag", true);
			const tagData = file.find((t) => t.name === tag);
			if (!tagData) {
				return context.reply(`No tag found with name __${tag}__`);
			}
			const modal = new ModalBuilder()
				.setTitle("Tag Edit")
				.setCustomId("@sern/tag/edit");

			const tagName = new TextInputBuilder()
				.setCustomId("tag-name")
				.setLabel("Tag Name")
				.setRequired()
				.setPlaceholder("Name of Tag")
				.setMinLength(3)
				.setMaxLength(32)
				.setStyle(TextInputStyle.Short)
				.setValue(tagData.name);

			const tagContent = new TextInputBuilder()
				.setCustomId("tag-content")
				.setLabel("Tag Content")
				.setRequired()
				.setPlaceholder("Content of Tag")
				.setMinLength(3)
				.setMaxLength(1900)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(tagData.content);

			const keywords = new TextInputBuilder()
				.setCustomId("tag-keywords")
				.setLabel("Tag Keywords")
				.setPlaceholder("Keywords for Tag, separated by comma")
				.setMaxLength(200)
				.setRequired(false)
				.setStyle(TextInputStyle.Short)
				.setValue(tagData.keywords.join(", "));

			const rows = [tagName, tagContent, keywords].map((r) =>
				new ActionRowBuilder<TextInputBuilder>().addComponents(r)
			);
			modal.addComponents(rows);
			context.user.data = tag;
			return context.interaction.showModal(modal);
		}
		if (subcmd === "delete") {
			const tag = options.getString("tag", true);
			const tagData = file.find((t) => t.name === tag);
			if (!tagData) {
				return context.reply("Tag not found");
			}
			file.splice(file.indexOf(tagData), 1);
			writeFileSync(
				`${process.cwd()}/tags.json`,
				JSON.stringify(file, null, 2)
			);

			return context.reply(`Tag ${tag} deleted`);
		}
	},
});

declare module "discord.js" {
	interface User {
		data: unknown;
	}
}
