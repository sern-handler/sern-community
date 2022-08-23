import { commandModule, CommandType } from "@sern/handler";
import type { TagMessage } from "../../types/index.js";

export default commandModule({
	type: CommandType.Button,
	name: "@falseTrigger",
	description: "False Trigger of tag",
	async execute(ctx) {
		const { message }: { message: TagMessage } = ctx;
		await ctx.deferUpdate();

		if (!message.tagTriggerId) return;
		if (message.tagTriggerId !== ctx.user.id) return;

		message.deletable && (await message.delete().catch(() => null));
	},
});
