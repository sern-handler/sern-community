import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Dependencies, Sern, single, Singleton } from "@sern/handler";
import "dotenv/config";
import { randomStatus, SernLogger } from "#utils";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [
		Partials.GuildMember,
		Partials.Message,
		Partials.ThreadMember,
		Partials.Channel,
	],
	sweepers: {
		messages: {
			interval: 43200,
			lifetime: 21600,
		},
	},
});


export interface BotDependencies extends Dependencies {
	'@sern/client' : Singleton<Client>;
	'@sern/logger' : Singleton<SernLogger>
}

export const useContainer = Sern.makeDependencies<BotDependencies>({
	build : root =>
		root
			.add({'@sern/client' : single(client) })
			.add({'@sern/logger': single(new SernLogger('info'))})
			.add({'process' : single(process) })
})
Sern.init({
	defaultPrefix: "sern",
	commands: "dist/src/commands",
	events: "dist/src/events",
	containerConfig : {
		get: useContainer
	}
});

client.once("ready", (client) => {
	randomStatus(client);
	console.log(`[✅]: Logged in as ${client.user.username}`);
});

await client.login();
