import { eventModule, EventType } from "@sern/handler";
import type { GuildMember } from "discord.js";

export default eventModule({
	type: EventType.Discord,
	name: "guildMemberAdd",
	async execute(member: GuildMember) {
		// TODO: This should be inferred
		const requiredRoles = ["980118655738212407", "981419402283085834"];
		for (const roleId of requiredRoles) {
			await member.roles.add(roleId);
		}
	},
});
