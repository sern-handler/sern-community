import { CommandPlugin, CommandType, PluginType } from "@sern/handler";
import type { Collection } from "discord.js";
import { cp } from "../commands/refresh.js";
import type { Data } from "../commands/plugin.js";
import { useContainer } from "../../src/index.js";
export function refreshCache(): CommandPlugin<CommandType.Slash> {
	return {
		type: PluginType.Command,
		description: "refreshes cache",
		async execute(payload, controller) {
			const [client] = useContainer("@sern/client");
			const cache = await cp(client);
			client.cache = cache;
			return controller.next();
		},
	};
}

declare module "discord.js" {
	interface Client {
		cache: Collection<string, Data> | null;
		data: unknown;
	}
}
