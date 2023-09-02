import { commandModule, CommandType } from "@sern/handler";
import type { TagMessage } from "typings";

export default commandModule({
	type: CommandType.Button,
	name: "@falseTrigger",
	description: "False Trigger of tag",
	async execute(ctx) {
		const { message }: { message: TagMessage } = ctx;
		if (!message.tagTriggerId) {
			await ctx.reply({
				content: "Sorry, this interaction is expired",
				ephemeral: true,
			});
			return;
		}

		if (message.tagTriggerId !== ctx.user.id) {
			await ctx.reply({
				content: "This ain't your shit",
			});
			return;
		}
		await ctx.deferUpdate();

		message.deletable && (await message.delete().catch(() => null));
	},
});
