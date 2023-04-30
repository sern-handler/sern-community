import { commandModule, CommandType } from "@sern/handler";
import type { GuildMember, APIStringSelectComponent } from "discord.js";

export default commandModule({
	type: CommandType.StringSelect,
	name: "role-menu",
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const roles = interaction.values;

		const menuRoles: string[] = (
			interaction.message.components[0].components[0].data as Readonly<APIStringSelectComponent>
		).options.map((o: { label: string; value: string }) => o.value);

		const member = interaction.member as GuildMember;
		if (!member) return;

		let content = `Roles Updated, you have been given the following roles:\n${roles
			.map((r) => `<@&${r}>`)
			.join("\n")}`;
		if (roles.length === 0) content = "No roles were selected, updated roles";

		const existing = member.roles.cache
			.filter((r) => r.id !== interaction.guildId)
			.map((r) => r.id)
			.filter((r) => !menuRoles.includes(r));

		await member.roles.set(roles.concat(existing)).catch(() => null);

		await interaction.editReply(content);
	},
});
