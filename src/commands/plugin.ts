import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { cooldown, publish } from "#plugins";
import { parse } from "jsdoc-parse-plus";
import { slashCommand } from "../utils/composable/slashCommand.js";
export default slashCommand({
	description: "View sern plugins",
	options: [
		{
			name: "plugin",
			description: "The plugin to view",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
			command: {
				onEvent: [],
				async execute(ctx) {
					const { cache } = ctx.client;
					const focus = ctx.options.getFocused();
					if (!cache)
						return ctx.respond([{ name: "No plugins found", value: "" }]);
					const data = [...cache.values()] as Data[];

					const plugins = data.map((d) => {
						const name = d.name.replace(".ts", "");
						return { name, value: d.download_url };
					});
					return ctx.respond(
						plugins.filter((p) =>
							p.name.toLowerCase().includes(focus?.toLowerCase())
						)
					);
				},
			},
		},
	],
	plugins: [
		publish(),
		cooldown.add([["user", "1/10"]], ({ seconds, context }) =>
			context.reply({
				content: `You gotta chill for ${seconds} seconds`,
				ephemeral: true,
			})
		),
	],
	async execute(ctx, [, options]) {
		if (!ctx.client.cache)
			return ctx.reply("Plugins are uncached, contact Evo!");

		const url = options.getString("plugin", true);
		const name = ctx.client.cache.findKey(
			(d) => d.download_url === url
		) as string;

		if (!name || !ctx.client.cache.get(name)!.rawData)
			return ctx.reply(`No plugin found at this [link](<${url}>)`);

		const JSdoc = parse(ctx.client.cache.get(name)!.rawData) as A;
		const github = `https://github.com/sern-handler/awesome-plugins/blob/main/TypeScript/${name}.ts`;

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTimestamp()
			.setTitle(`${name}`)
			.setURL(github)
			.setFields(
				{
					name: "Description",
					value: JSdoc.description.value,
				},
				{
					name: "Version",
					value: JSdoc.version.value,
				},
				{
					name: "Author",
					value: parseAuthor(JSdoc.author.value),
				},
				{
					name: "Example",
					value: (JSdoc as unknown as B).example[0].value,
				}
			);

		return ctx.reply({
			embeds: [embed],
		});
	},
});

function parseAuthor(s: string) {
	let [ghAuthor, discordAuthor] = s.split(" ");
	ghAuthor = ghAuthor.replace("@", "");
	const url = `https://github.com/${ghAuthor}`;
	return `[${ghAuthor}](${url}) ${discordAuthor}`;
}

export interface Data {
	name: string;
	download_url: string;
	rawData: string;
}

interface ParsedData {
	author: DocData;
	description: DocData;
	version: DocData;
	example: DocData[];
	requires?: DocData[];
}

interface DocData {
	tag: string;
	value: string;
	raw: string;
}

type A = Record<keyof ParsedData, DocData>;
type B = Record<keyof ParsedData, DocData[]>;
