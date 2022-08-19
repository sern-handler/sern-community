import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, Collection, Role, TextChannel, SelectMenuBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ownerOnly } from "../plugins/ownerOnly";
import { publish } from "../plugins/publish";
import { Resolver } from "../Resolver";

export default commandModule({
	plugins: [ownerOnly(), publish()],
	type: CommandType.Slash,
	description: "Select Menu Role",
	options: [
		{
			name: 'channel',
			type: ApplicationCommandOptionType.Channel,
			description: 'The channel to send the message to',
			channelTypes: [ChannelType.GuildText],
			required: true
		},
		{
			name: 'role',
			type: ApplicationCommandOptionType.String,
			description: 'The roles to attach (upto 25)',
			required: true,
		}
	],
	async execute(ctx, [, options]) {
		const channel = options.getChannel('channel', true) as TextChannel;
		const role = new Resolver(options.getString('role', true), ctx.interaction).roles;

		if (!channel || !role) return ctx.reply("Missing channel or role");
		if (role.size > 25) return ctx.reply("Too many roles");

		const cdn = role.filter(
			(r) =>
				r.managed ||
				r.position > (ctx.guild?.members.me)!.roles.highest.position
		).size;
		if (cdn) {
			return ctx.reply(
				`Some roles are managed by integration or higher than my highest role.\nPlease try again`
			);
		}
		await ctx.interaction.deferReply();

		const row = createMenu(channel, role);
		await channel.send({
			content: "Role Menu",
			components: [row],
		});
		await ctx.interaction.editReply("✅ Done!");
	},
});

function createMenu(channel: TextChannel, role: Collection<string, Role>) {
	if (!channel || !role) throw new Error("Missing channel or role");
	const menu = new SelectMenuBuilder()
		.setCustomId("role-menu")
		.setMaxValues(role.size)
		.setMinValues(0)
		.setPlaceholder("Pick some roles here!")
		.setOptions(
			role.map((r) => {
				return {
					label: r.name,
					value: r.id,
				};
			})
		);
	const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(menu);
	return row;
}
