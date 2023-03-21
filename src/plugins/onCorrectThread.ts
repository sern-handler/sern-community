import { controller, DiscordEventControlPlugin } from "@sern/handler";
import { ChannelType } from "discord.js";

export function onCorrectThread(parentId: string) {
    return DiscordEventControlPlugin(
        "threadCreate",
        (thread, newlyMade) => {
	const isBadThread = 
            !thread.parent ||
            thread.parentId !== parentId ||
            thread.parent.type !== ChannelType.GuildForum ||
            !newlyMade;
            if (!isBadThread) {
                return controller.next();
            }
                return controller.stop();
        }
    )
}
