import { CommandType, commandModule, Context } from "@sern/handler";
import { Client, Collection } from "discord.js";
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
		if (
			guild.id !== "941002690211766332" &&
			ctx.user.id !== "697795666373640213"
		)
			return;
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
