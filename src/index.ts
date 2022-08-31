import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";

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
	sweepers : {
		messages : {
			interval : 43200,
		  lifetime: 21600
		}
	},

});

Sern.addExternal(process);
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

await client.login();
