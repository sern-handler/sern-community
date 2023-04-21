import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Dependencies, Sern, single, Singleton } from "@sern/handler";
import "dotenv/config";
import { randomStatus, SernLogger } from "#utils";
import { CommandSyncer } from "./utils/SyncCommands.js";

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
	"@sern/client": Singleton<Client>;
	"@sern/logger": Singleton<SernLogger>;
	sync: Singleton<CommandSyncer>;
}

export const useContainer = Sern.makeDependencies<BotDependencies>({
	build: (root) =>
		root
			.add({ "@sern/client": single(() => client) })
			.upsert({ "@sern/logger": single(() => new SernLogger("info")) })
			.add({ process: single(() => process) })
			.add((ctx) => ({
				sync: single(
					() => new CommandSyncer(ctx["@sern/logger"], ctx["@sern/client"], [])
				),
			})),
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
	const [syncer] = useContainer("sync");
	logger.info({ message: `[✅]: Logged in as ${client.user.username}` });
	syncer
		.sync()
		.catch((e) =>
			logger.error({ message: e ?? "Something went wrong with syncing" })
		)
		.then(() => logger.info({ message: "Commands synced successfully" }));
});

await client.login();
