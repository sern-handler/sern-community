import { eventModule, EventType, Service } from "@sern/handler";
import type { GuildMember } from "discord.js";

export default eventModule({
	type: EventType.Discord,
	name: "guildMemberAdd",
	async execute(member: GuildMember) {
		// TODO: This should be inferred
		if (member.pending) return;
		const logger = Service("@sern/logger");
		logger.info({ message: `${member.user.username} joined` });
		const requiredRoles = ["980118655738212407"];
		await member.roles.add(requiredRoles);
	},
});
