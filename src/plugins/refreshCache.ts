import { CommandInitPlugin, CommandPlugin, CommandType, controller, PluginType } from "@sern/handler";
import type { Collection } from "discord.js";
import { cp } from "../commands/refresh.js";
import type { Data } from "../commands/plugin.js";
import { useContainer } from "../../src/index.js";
export function refreshCache() {
    return CommandInitPlugin<CommandType.Slash>(async (payload) => {
        const [client] = useContainer("@sern/client");
        const cache = await cp(client);
        client.cache = cache;
        return controller.next();
    }) 
}

declare module "discord.js" {
	interface Client {
		cache: Collection<string, Data> | null;
		data: unknown;
	}
}
