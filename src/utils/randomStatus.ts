import { ActivityType, Client, ClientPresenceStatus } from "discord.js";

const statues: [
	Exclude<ActivityType, ActivityType.Custom>,
	string,
	ClientPresenceStatus
][] = [
	[ActivityType.Watching, "the sern community", "online"],
	[ActivityType.Listening, "Evo", "dnd"],
	[ActivityType.Playing, "with @sern/cli", "idle"],
	[ActivityType.Watching, "sern bots", "dnd"],
	[ActivityType.Watching, "github stars go brrr", "online"],
	[ActivityType.Listening, "Spotify", "dnd"],
	[ActivityType.Listening, "what's bofa", "idle"],
];

export function randomStatus(client: Client) {
	console.clear();
	setInterval(() => {
		const shuffledStatuses = shuffleArray(statues);
		const [type, name, status] = [...shuffledStatuses].shift()!;
		client.user!.setPresence({ activities: [{ name, type }], status });
	}, 60_000);
}

function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return [...array];
}
