import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";

import { Sern, SernEmitter } from "@sern/handler";
import "dotenv/config";
import { randomStatus } from "./utils/randomStatus.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember, Partials.Message, Partials.ThreadMember],
	sweepers: {
		messages: {
			interval: 43200,
			lifetime: 21600,
		},
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
	randomStatus(client);
	console.log(`[✅]: Logged in as ${client.user.username}`);
});

await client.login();
