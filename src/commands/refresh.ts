import { Collection, Client } from "discord.js";
import { fetch } from "undici";
import type { Data } from "./plugin.js";
import { ownerOnly, publish, refreshCache } from "#plugins";
import { Evo } from "#constants";
import { slashCommand } from "#utils";

export default slashCommand({
	plugins: [
		refreshCache(),
		publish({
			dmPermission: false,
			defaultMemberPermissions: ["Administrator"],
		}),
		ownerOnly([Evo]),
	],
	description: "refresh plugins cache",
	async execute(ctx) {
		const success = await cp(ctx.client);
		if (!success)
			return ctx.reply({
				content: "Fetch failed!",
				ephemeral: true,
			});
		return ctx.reply({
			content: `Refreshed Plugins! [${success.size} plugins]`,
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
