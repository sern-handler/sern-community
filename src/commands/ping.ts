import { commandModule, CommandType } from "@sern/handler";
import { publish } from "../plugins/publish.js";
export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
	description: "Pong!",
	execute: async (context) => {
		await context.reply(`Pong 🏓 \`${context.client.ws.ping}ms\``);
	},
});
