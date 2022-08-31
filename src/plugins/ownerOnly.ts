import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export const ownerIDs = [
	"697795666373640213",
	"182326315813306368",
	"756393473430519849",
];
export function ownerOnly(): EventPlugin<CommandType.Both> {
	return {
		type: PluginType.Event,
		description: "Allows only bot owner to run command",
		async execute(event, controller) {
			const [ctx] = event;
			if (ownerIDs.includes(ctx.user.id)) return controller.next();

			return controller.stop();
		},
	};
}
