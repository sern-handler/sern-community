import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, Collection, Role, TextChannel, SelectMenuBuilder } from "discord.js";
import { ownerOnly } from "../plugins/ownerOnly";

export default commandModule({
	plugins: [ownerOnly()],
	type: CommandType.Text,
	description: "Select Menu Role",
	async execute(ctx) {
		const channel = ctx.message.mentions.channels.first() as TextChannel;
		const role = ctx.message.mentions.roles;

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

		const row = createMenu(channel, role);
		await channel.send({
			content: "Role Menu",
			components: [row],
		});
		await ctx.message.react("✅");
	},
});

function createMenu(channel: TextChannel, role: Collection<string, Role>) {
	// sern role #channel @role
	if (!channel || !role) throw new Error("Missing channel or role");
	const menu = new SelectMenuBuilder()
		.setCustomId("role-menu")
		.setMaxValues(role.size)
		.setMinValues(0)
		.setPlaceholder("Pick some roles")
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
