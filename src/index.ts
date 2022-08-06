import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";

import { Sern, SernEmitter } from "@sern/handler";
import "dotenv/config";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember, Partials.GuildMember, Partials.Message],
});

Sern.init({
	client,
	sernEmitter: new SernEmitter(),
	defaultPrefix: "sern",
	commands: "dist/src/commands",
	events: "dist/src/events",
});

client.once("ready", (client) => {
	client.user.setActivity("the sern Community", {
		type: ActivityType.Watching,
	});

	console.log(`[✅]: Logged in as ${client.user.username}`);
});

client.login();
// const d = `// @ts-nocheck
// /**
//  * This is dmOnly plugin, it allows commands to be run only in DMs.
//  *
//  * @author @EvolutionX-10
//  * @version 1.1.0-beta
//  * @requires \`partials: [Partials.Channel], intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent]
//  * @example
//  * \`\`\`ts
//  * import { dmOnly } from "../path/to/your/plugin/folder";
//  * import { commandModule } from "@sern/handler";
//  * export default commandModule({
//  * 		plugins: [dmOnly()],
//  * 		execute: // your code
//  * })
//  * \`\`\`
//  */`

// console.log(parse(d, ['@license']));