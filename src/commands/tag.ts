import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { existsSync } from "fs";
import { publish } from "../plugins/publish";
import type { TagData } from "./handlers/tagCreate";

export default commandModule({
	type: CommandType.Slash,
	description: "Send a tag",
	plugins: [publish()],
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
					const filePath = `./tags.json`;
					const focus = ctx.options.getFocused();
					if (!existsSync(filePath)) {
						return ctx.respond([{ name: "No tags found", value: "" }]);
					} else {
						const file: TagData[] = require(`${process.cwd()}\\tags.json`);
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
		{
			name: "target",
			type: ApplicationCommandOptionType.User,
			required: false,
			description: "Who should I mention while showing the tag?",
		},
	],
	execute(ctx, args) {
		const [, options] = args;
		const user = options.getUser("target");
		const mention = user ? `**Tag suggestion for:** ${user}\n\n` : '';
		const tag = options.getString("tag", true);
		const file: TagData[] = require(`${process.cwd()}\\tags.json`);
		const tagData = file.find((t) => t.name === tag);
		if (!tagData) {
			return ctx.reply(`No tag found with name __${tag}__`);
		}
		return ctx.reply(mention.concat(tagData.content));
	},
});
