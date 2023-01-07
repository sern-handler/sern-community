import { eventModule, EventType } from "@sern/handler";
import { AnyThreadChannel, ChannelType, EmbedBuilder } from "discord.js";
import { onCorrectThread } from "../plugins/onCorrectThread.js";
import { forumID } from "#constants";

export default eventModule({
	type: EventType.Discord,
	plugins : [onCorrectThread(forumID)],
	name: "threadCreate",
	async execute(thread: AnyThreadChannel, _: boolean) {
		if (thread.appliedTags.length > 3)
			await thread.setAppliedTags(thread.appliedTags.slice(0, 3));

		const msg = await thread.fetchStarterMessage().catch(() => null);
		if (!msg) return thread.setLocked(true);

		const list = `• What is your [\`discord.js\`](https://discord.js.org/) version?\n• What is your [\`@sern/handler\`](https://sern-handler.js.org) version?\n• If any error is occuring, what error?`;

		const embed = new EmbedBuilder()
			.setDescription(
				`Hello ${msg.author}! Thank you for creating a dedicated post for your issue\n` +
					`Please make sure you've read the **__Post Guidelines__**!\n` +
					`In the meanwhile you wait for your answer, It is recommended to provide details as much as possible\n`
						.concat(list)
						.concat(`\n\n\nIssue Solved? Run </solved:1026499792194510939>`)
			)
			.setColor("Random")
			.setTimestamp()
			.setThumbnail(msg.client.user!.displayAvatarURL({ size: 2048 }))
			.setTitle("Things you should know");

		await msg.reply({
			embeds: [embed],
		});
	},
});
