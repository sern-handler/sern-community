import { CommandPlugin, CommandType, PluginType } from "@sern/handler";
import type { Collection } from "discord.js";
import { cp } from "../commands/eval";
import type { Data } from "../commands/plugin";
export function refreshCache(): CommandPlugin<CommandType.Slash> {
	return {
		type: PluginType.Command,
		description: "refreshes cache",
		async execute(wrapper, payload, controller) {
			const cache = await cp(wrapper.client);
			wrapper.client.cache = cache;
			console.log("~ Cached plugins for the first time");
			return controller.next();
		},
	};
}

declare module "discord.js" {
	interface Client {
		cache: Collection<string, Data> | null;
	}
}
