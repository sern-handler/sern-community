import { CommandType, EventPlugin, PluginType } from "@sern/handler";
import { ownerIDs } from "#constants";

export function ownerOnly(override?: string[]): EventPlugin<CommandType.Both> {
	return {
		type: PluginType.Event,
		description: "Allows only bot owner to run command",
		async execute(event, controller) {
			const [ctx] = event;
			if ((override ?? ownerIDs).includes(ctx.user.id))
				return controller.next();
			await ctx.reply({
				content: `Not for you! Only these users can run this\n${map(
					override ?? ownerIDs
				)}`,
				ephemeral: true,
			});
			return controller.stop();

			function map(s: string[]) {
				const userMention = (s: string) => `<@!${s}>`;
				return s.map((id) => `\` - \` ${userMention(id)}`).join("\n");
			}
		},
	};
}
