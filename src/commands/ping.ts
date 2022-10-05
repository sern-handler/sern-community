import { commandModule, CommandType } from "@sern/handler";
import { publish } from "#plugins";
import { Timestamp } from "#utils";

export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
	description: "Pong!",
	execute: async (context) => {
		const uptime = new Timestamp(context.client.readyTimestamp!);
		await context.reply(
			`Pong 🏓 \`${
				context.client.ws.ping
			}ms\`\nStarted running ${uptime.getRelativeTime()}`
		);
	},
});
