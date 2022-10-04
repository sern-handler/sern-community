import { eventModule, EventType } from "@sern/handler";
import { AnyThreadChannel, ChannelType, EmbedBuilder } from "discord.js";

export default eventModule({
	type: EventType.Discord,
	name: "threadCreate",
	async execute(thread: AnyThreadChannel, newlyMade: boolean) {
		if (!thread.parent) return;
		if (thread.parentId !== "1019807803935825922") return;
		if (thread.parent.type !== ChannelType.GuildForum) return;
		if (!newlyMade) return;

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
