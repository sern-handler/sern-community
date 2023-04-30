import { CommandType, CommandControlPlugin, controller } from "@sern/handler";

export function channelOnly(channelIds: string[], onFail?: string) {
	return CommandControlPlugin<CommandType.Both>((ctx, _) => {
		if (!ctx.channel) throw new Error("Channel not found!");
		if (
			!channelIds.includes(ctx.channel.id) &&
			ctx.channel.isThread() &&
			!channelIds.includes(ctx.channel.parentId!)
		) {
			onFail ? ctx.reply({ content: onFail, ephemeral: true }) : null;
			return controller.stop();
		}
		return controller.next();
	});
}
