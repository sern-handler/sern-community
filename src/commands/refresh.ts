import { commandModule, CommandType } from "@sern/handler";
import { Collection, Client } from "discord.js";
import { publish } from "../plugins/publish.js";
import { fetch } from "undici";
import type { Data } from "./plugin.js";

export default commandModule({
	type: CommandType.Slash,
	plugins: [
		publish({
			dmPermission: false,
			defaultMemberPermissions: ["Administrator"],
		}),
	],
	description: "refresh plugins cache",
	async execute(ctx) {
		if (ctx.user.id !== "697795666373640213") {
			return ctx.reply({
				content: `Only <@!697795666373640213> can use this!`,
				ephemeral: true,
			});
		}
		const success = await cp(ctx.client);
		if (!success)
			return ctx.reply({
				content: "Fetch failed!",
				ephemeral: true,
			});
		return ctx.reply({
			content: "Refreshed Plugins!",
			ephemeral: true,
		});
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
		data.rawData = await (await fetch(data.download_url))
			.text()
			.catch(() => "");
		cache.set(name, data);
	}
	client.cache = cache;
	return cache;
}
