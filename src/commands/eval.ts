import { commandModule, CommandType } from "@sern/handler";
import { EmbedBuilder } from "discord.js";
import { inspect } from "util";
import { ownerOnly } from "#plugins";

export default commandModule({
	type: CommandType.Text,
	description: "Eval something",
	plugins: [ownerOnly()],
	alias: ["ev"],
	execute: async (ctx, args) => {
		let code: string[] | string = args[1];

		code = code.join(" ") as string;
		if (code.includes("await")) {
			const ar = code.split(";");
			const last = ar.pop();
			code = `(async () => {\n${ar.join(";\n")}\nreturn ${
				last?.trim() ?? " "
			}\n\n})();`;
		}
		const { channel, guild, client, user, member, message: msg } = ctx;
		if (
			["TOKEN", "process.env", "token"].some((e) => code.includes(e)) &&
			ctx.user.id !== "697795666373640213"
		)
			return ctx.message.react("❌");

		let result: unknown | string;

		try {
			result = eval(code);
		} catch (error) {
			result = error;
		}
		if (result instanceof Promise)
			result = await result.catch((e: Error) => new Error(e.message));
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

		function send(id: string, ping = false) {
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
			const content = ping ? "@everyone" : undefined;
			channel.isTextBased() && channel.send({ content, embeds: [embed] });
			return "Done sir";
		}
	},
});

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
