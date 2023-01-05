import { CommandType, Controller, DiscordEventPlugin, PluginType } from "@sern/handler";
import type { AnyThreadChannel } from "discord.js";
import { ChannelType } from "discord.js";


export function onCorrectThread(parentId: string){
	return {
		name: 'threadCreate',
		type: PluginType.Event,
		execute([thread, newlyMade]: [thread: AnyThreadChannel, newlyMade: boolean], controller: Controller) {
			const isValidThread = !thread.parent || thread.parentId !== parentId || thread.parent.type !== ChannelType.GuildForum || !newlyMade;
			if(!isValidThread) {
				return controller.stop()
			}
			return controller.next()
		}
	}  as DiscordEventPlugin //hotfix until i get it worked out
}