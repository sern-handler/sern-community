import { commandModule, CommandType } from "@sern/handler";
import { Collection, Client } from "discord.js";
import { publish } from "../plugins/publish.js";
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
		await cp(ctx.client);
		return ctx.reply({
			content: `Refreshed plugins!`,
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
		cache.set(name, data);
	}
	client.cache = cache;
	return cache;
}
