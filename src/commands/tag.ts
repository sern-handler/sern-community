import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { existsSync } from "fs";
import { publish } from "#plugins";
import { Paginator, slashCommand, require } from "#utils";
import { Tag, type TagData } from "typings";
import { TagList } from "#constants";

export default slashCommand({
	description: "Send a tag",
	plugins: [publish()],
	options: [
		{
			name: "list",
			type: ApplicationCommandOptionType.Subcommand,
			description: "List all tags",
		},
		{
			name: "send",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Send a tag",
			options: [
				{
					name: "tag",
					type: ApplicationCommandOptionType.String,
					description: "Tag you want to send",
					required: true,
					autocomplete: true,
					command: {
						onEvent: [],
						execute(ctx) {
							const focus = ctx.options.getFocused();
							if (!existsSync(`./tags.json`)) {
								return ctx.respond([{ name: "No tags found", value: "" }]);
							} else {
								const file: TagData[] = require(TagList);
								const tags = file.map((t) => t.name);
								return ctx.respond(
									tags
										.filter((t) =>
											focus.length ? t.toLowerCase().includes(focus.toLowerCase()) : true
										)
										.map((t) => ({ name: t, value: t }))
								);
							}
						},
					},
				},
				{
					name: "target",
					type: ApplicationCommandOptionType.User,
					required: false,
					description: "Who should I mention while showing the tag?",
				},
			],
		},
	],
	execute(ctx, args) {
		const [, options] = args;
		const subCmd = options.getSubcommand();
		switch (subCmd) {
			case "list": {
				const file: TagData[] = require(TagList);
				const embeds = file.map((tag) => {
					const embed = new EmbedBuilder()
						.setTitle(tag.name)
						.setDescription(tag.content)
						.setColor("Random")
						.addFields({
							name: "Keywords",
							value: tag.keywords.join(", ") || "No keywords!",
						})
						.setTimestamp();
					return embed;
				});
				const paginator = new Paginator({ embeds }).setSelectMenuOptions(
					...Array(embeds.length)
						.fill(null)
						.map((_, i) => ({
							label: embeds[i].data.title!,
							value: `${i}`,
							default: i === 0,
						}))
				);

				return paginator.run(ctx.interaction);
			}
			case "send": {
				const user = options.getUser("target");
				const mention = user ? `**Tag suggestion for:** ${user}\n\n` : "";
				const tag = options.getString("tag", true);
				const file: TagData[] = require(TagList);
				const tagData = file.find((t) => t.name === tag);
				if (!tagData) {
					return ctx.reply(`No tag found with name __${tag}__`);
				}
				return ctx.reply(mention.concat(tagData.content));
			}
		}
	},
});
