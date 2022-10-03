import { eventModule, EventType } from "@sern/handler";
import { ChannelType, EmbedBuilder, ThreadChannel } from "discord.js";
import { createRequire } from "module";
import type { TagData } from "../types";
const require = createRequire(import.meta.url);
const file: TagData[] = require(`${process.cwd()}/tags.json`);
// @ts-ignore
export default eventModule({
	type: EventType.Discord,
	name: "threadCreate",
	async execute(thread: ThreadChannel, newlyMade: boolean) {
		if (!thread.parent) return;
		if (thread.parentId !== "1019807803935825922") return;
		if (thread.parent.type !== ChannelType.GuildForum) return;
		if (!newlyMade) return;

		const msg = await thread.fetchStarterMessage().catch(() => null);
		if (!msg) return thread.setLocked(true);

		const how2ask = file.find((t) => t.name === "How2Ask");
		if (!how2ask) return;

		const embed = new EmbedBuilder()
			.setDescription(
				how2ask.content.concat(
					`\n\n\nIssue Solved? Run </solved:1026499792194510939>`
				)
			)
			.setColor("Random")
			.setTimestamp()
			.setTitle("Things you should know!");

		await msg.reply({
			content:
				`Hello ${msg.author.username}! Thank you for creating a dedicated post for your issue\n` +
				`Please make sure you've read the **__Post Guidelines__**!\n` +
				`Any attempt in breaking rules will be punishable event\n` +
				`In the meanwhile you wait for your answer, It is recommended to provide details as much as possible\n` +
				`Below is the possible list you should cross check and provide info if necessary`,
			embeds: [embed],
		});
	},
});
