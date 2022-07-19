import {
	Client,
	GatewayIntentBits,
	Partials,
	ActivityType
} from 'discord.js';

import { Sern, SernEmitter } from '@sern/handler';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, 
	],
	partials: [
		Partials.GuildMember,
		Partials.GuildMember,
		Partials.Message
	]
});

Sern.init({
	client,
	sernEmitter: new SernEmitter(),
	defaultPrefix: 'sern', 
	commands: 'dist/commands',
	events: 'dist/events',
});

client.once('ready', (client) => {
	client.user.setActivity('the sern Community', { type: ActivityType.Watching });

	console.log(`[✅]: Logged in as ${client.user.username}`);
});

client.login(process.env.DISCORD_TOKEN);
