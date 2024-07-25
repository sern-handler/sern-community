import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies, Service } from "@sern/handler";
import { SernLogger } from "#utils";
import { Octokit } from "@octokit/rest";
import { cp } from "./commands/refresh.js";

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

await makeDependencies(root => {
        root.add("@sern/client", client);
        root.swap("@sern/logger", new SernLogger("info"))
        root.add('octokit', new Octokit({ auth: process.env.GITHUB_TOKEN }))
});

Sern.init({
    defaultPrefix: "sern",
    commands: "dist/src/commands",
    events: "dist/src/events",
});

client.once("ready", async (client) => {
    const logger = Service("@sern/logger");
    logger.info({ message: `[✅]: Logged in as ${client.user.username}` });
    await cp();
});

await client.login(process.env.DISCORD_TOKEN);
