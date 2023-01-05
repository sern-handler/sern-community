import type { ClientEvents } from "discord.js";
import type { Controller, DiscordEventPlugin } from "@sern/handler";
import { eventModule, EventType } from "@sern/handler";

//
// export function discordEvent<T extends keyof ClientEvents>(
// 	data : {
// 		name : T,
// 		plugins : DiscordEventPlugin<T>[]
// 		execute: (args: ClientEvents[T], controller: Controller) => any
// 	}
// ) {
// 	return eventModule({
// 		name: data.name,
// 		type: EventType.Discord,
// 		execute
// 	})
// }