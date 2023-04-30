import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Dependencies, Sern, single, Singleton } from "@sern/handler";
import "dotenv/config";
import { randomStatus, SernLogger /*CommandSyncer*/ } from "#utils";
import { Octokit } from "@octokit/rest";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.GuildMember, Partials.Message, Partials.ThreadMember, Partials.Channel],
	sweepers: {
		messages: {
			interval: 43200,
			lifetime: 21600,
		},
	},
});

export interface BotDependencies extends Dependencies {
	"@sern/client": Singleton<Client>;
	"@sern/logger": Singleton<SernLogger>;
	octokit: Singleton<Octokit>;
}

export const useContainer = Sern.makeDependencies<BotDependencies>({
	build: (root) =>
		root
			.add({ "@sern/client": single(() => client) })
			.upsert({ "@sern/logger": single(() => new SernLogger("info")) })
			.add({ process: single(() => process) })
			.add({
				octokit: single(() => new Octokit({ auth: process.env.GITHUB_TOKEN })),
			}),
	//  .add(ctx =>
	//		({'sync' : single(() => new CommandSyncer(ctx['@sern/logger'], ctx['@sern/client'], ["941002690211766332"]))}
	//	))
});
Sern.init({
	defaultPrefix: "sern",
	commands: "dist/src/commands",
	events: "dist/src/events",
	containerConfig: {
		get: useContainer,
	},
});

client.once("ready", (client) => {
	randomStatus(client);
	const [logger] = useContainer("@sern/logger");
	logger.info({ message: `[✅]: Logged in as ${client.user.username}` });
});

await client.login();
