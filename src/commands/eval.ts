import { CommandType, commandModule, Context } from "@sern/handler";
import { Client, Collection, EmbedBuilder } from "discord.js";
import { inspect } from "util";
import { fetch } from "undici";
import { ownerOnly } from "../plugins/ownerOnly";
import type { Data } from "./plugin";

export default commandModule({
	type: CommandType.Text,
	description: "Eval something",
	plugins: [ownerOnly()],
	alias: ["ev"],
	execute: async (ctx, args) => {
		const [type, code] = args;
		const { channel, guild, client, user, member, message: msg } = ctx;

		function send(id: string, ping: boolean = false) {
			const channel = client.channels.cache.get(id);
			if (!channel) return;
			const embed = new EmbedBuilder()
				.setColor(0xcc5279)
				.setTitle("v1 is out!")
				.setThumbnail(client.user?.displayAvatarURL() ?? "")
				.setImage(
					"https://raw.githubusercontent.com/sern-handler/.github/main/banner.png"
				)
				.setAuthor({ name: "sern", url: "https://sern-handler.js.org/" })
				.setDescription(
					`__**Quick Look:**__\n\n${text()}\n\nThank you all for being patient! <@&981419402283085834> will continue being given out until next week`
				)
				.setFooter({ text: "Supports DJS v14.2 and above" })
				.setTimestamp();
			const content = ping ? '@everyone' : null;
			channel.isTextBased() && channel.send({ content, embeds: [embed] });
			return "Done sir";
		}

		if (type !== "text") return;
		if (
			(code.join(" ").includes("send") || code.join(" ").includes("reply")) &&
			ctx.user.id !== "697795666373640213"
		)
			return;

		if (code.join(" ").includes("process.env")) return;
		if (code.join(" ").includes("token")) return;
		let result: unknown | string;

		try {
			result = eval(code.join(" "));
		} catch (error) {
			result = error;
		}
		if (result instanceof Promise) result = await result;
		if (typeof result !== "string") {
			result = inspect(result, {
				depth: 0,
			});
		}

		result = "```js\n" + result + "\n```";

		if ((result as string).length > 2000) {
			channel!.send("Result is too long to send");
		}
		ctx.channel!.send({ content: result as string });
	},
});

export async function cp(client: Client) {
	const cache: Collection<string, Data> = new Collection();
	const link = `https://api.github.com/repos/sern-handler/awesome-plugins/contents/TypeScript`;
	const resp = await fetch(link).catch(() => null);
	if (!resp) return null;
	const dataArray = (await resp.json()) as Data[];
	for (const data of dataArray) {
		const name = data.name.replace(".ts", "");
		cache.set(name, data);
	}
	client.cache = cache;
	return cache;
}

function text() {
	const obj = [
		{
			name: `[CLI](https://github.com/sern-handler/cli):`,
			value: `\` - \` Added JavaScript-ESM Template`,
		},
		{
			name: `[@sern/handler](https://www.npmjs.com/package/@sern/handler):`,
			value: `\` - \` ESM support\n\` - \` More secure module system\n\` - \` Can be tree shaken (smaller project size)\n\` - \` Reduced package size by **9 MBs**`,
		},
		{
			name: `[Website](https://sern-handler.js.org/)`,
			value: `\` - \` Fully revamped website\n\` - \` API documentation\n\` - \` A guide to get you started\n\` - \` New homepage!`,
		},
		{
			name: `[Community bot](https://github.com/sern-handler/sern-community)`,
			value: `\` - \` Documentation at your hands in this server!\n\` - \` Autocompletes\n\` - \` Tag System\n\` - \` Features all the plugins in [this repository](https://github.com/sern-handler/awesome-plugins)`,
		},
	];
	return obj.map(({ name, value }) => `**${name}**\n${value}`).join("\n\n");
}
