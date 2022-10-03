import { commandModule, CommandType } from "@sern/handler";
import { ChannelType } from "discord.js";
import { channelOnly } from "../plugins/channelOnly.js";
import { ownerIDs } from "../plugins/ownerOnly.js";
import { publish } from "../plugins/publish.js";

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

		await ctx.reply({
			content: `This post is now closed, glad the issue got solved!`,
			ephemeral: false,
		});

		await ctx.channel.setAppliedTags([...ctx.channel.appliedTags, tag.id]);
		await ctx.channel.setLocked(true, `Closed by ${ctx.user.tag}`);
		await ctx.channel.setArchived(true, `Closed by ${ctx.user.tag}`);
	},
});
