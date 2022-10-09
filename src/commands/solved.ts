import { commandModule, CommandType } from "@sern/handler";
import { ChannelType } from "discord.js";
import { publish, channelOnly } from "#plugins";
import { ownerIDs } from "#constants";
import { Timestamp } from "#utils";

export default commandModule({
	type: CommandType.Slash,
	description: "Solved the issue? Close the post!",
	plugins: [
		publish({ guildIds: ["889026545715400705"] }),
		channelOnly(["1019807803935825922"]),
	],
	async execute(ctx) {
		if (!ctx.channel) return;
		if (!ctx.channel.isThread() || !ctx.channel.parent) return;
		if (ctx.channel.parent.type !== ChannelType.GuildForum) return;
		if (!ctx.channel.ownerId) await ctx.channel.fetchOwner();
		if (!ownerIDs.concat(ctx.channel.ownerId!).includes(ctx.user.id)) return;

		const tag = ctx.channel.parent.availableTags.find(
			(t) => t.name === "Solved"
		);
		if (!tag)
			return ctx.reply({
				content: "Something bad happened, Please contact Evo!",
				ephemeral: true,
			});

		const memberCount = `• \`${ctx.channel.memberCount}\` member(s) participated in this post!`;
		const msgCount = `• \`${
			(ctx.channel.messageCount ?? 0) + 1
		}\` message(s) are present here`;
		const msgSent = `• \`${
			(ctx.channel.totalMessageSent ?? 0) + 1
		}\` message(s) were sent in total here`;
		const createdAt = `• This post was created ${new Timestamp(
			ctx.channel.createdTimestamp!
		).getRelativeTime()}`;
		const solvedAt = `• This post was solved ${new Timestamp(
			Date.now()
		).getRelativeTime()}`;

		const funstats = `${ctx.channel.memberCount ? memberCount : ""}\n${
			ctx.channel.messageCount ? msgCount : ""
		}\n${
			ctx.channel.totalMessageSent ? msgSent : ""
		}\n${createdAt}\n${solvedAt}`;

		await ctx.reply({
			content: `This post is now closed, glad the issue got solved!\n\n\n${funstats}`,
			ephemeral: false,
		});

		await ctx.channel
			.setAppliedTags([...ctx.channel.appliedTags.slice(0, 4), tag.id])
			.catch(() => null);
		await ctx.channel
			.setLocked(true, `Closed by ${ctx.user.tag}`)
			.catch(() => null);
		await ctx.channel
			.setArchived(true, `Closed by ${ctx.user.tag}`)
			.catch(() => null);
	},
});
