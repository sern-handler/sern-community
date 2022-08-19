import {
	CommandPlugin,
	CommandType,
	PluginType,
	SernOptionsData,
} from "@sern/handler";
import {
	ApplicationCommandData,
	ApplicationCommandType,
	PermissionResolvable,
} from "discord.js";

export function publish(
	options: PublishOptions = {
		guildIds: [],
		dmPermission: true,
		defaultMemberPermissions: null,
	}
): CommandPlugin<CommandType.Slash | CommandType.Both> {
	return {
		type: PluginType.Command,
		description: "Manage Slash Commands",
		name: "slash-auto-publish",
		async execute({ client }, { mod: module }, controller) {
			let { defaultMemberPermissions, dmPermission, guildIds } = options;
			function c(e: unknown) {
				console.error("publish command didnt work for", module.name!);
				console.error(e);
			}
			try {
				const commandData: ApplicationCommandData = {
					type: CommandTypeRaw[module.type],
					name: module.name!,
					description: module.description,
					options: optionsTransformer(module.options ?? []),
					defaultMemberPermissions,
					dmPermission,
				};
				if (!Array.isArray(guildIds)) guildIds = [guildIds];

				if (!guildIds.length) {
					const cmd = (await client.application!.commands.fetch()).find(
						(c) => c.name === module.name
					);
					if (cmd) {
						if (!cmd.equals(commandData, true)) {
							console.log(`Found differences in global command ${module.name}`);
							cmd.edit(commandData).then(() => {
								console.log(
									`${module.name} updated with new data successfully!`
								);
							});
						}
						return controller.next();
					}

					console.log("Command created", module.name!);
					client.application!.commands.create(commandData).catch(c);
					return controller.next();
				}

				for (const id of guildIds) {
					const guild = await client.guilds.fetch(id).catch(c);
					if (!guild) continue;
					const guildcmd = (await guild.commands.fetch()).find(
						(c) => c.name === module.name
					);
					if (guildcmd) {
						if (!guildcmd.equals(commandData, true)) {
							console.log(`Found differences in command ${module.name}`);
							console.log(`${module.name} updated with new data successfully!`);
							guildcmd.edit(commandData).catch(c);
							continue;
						}
						continue;
					}
					console.log("Guild Command created", module.name!, guild.name);
					guild.commands.create(commandData).catch(c);
				}
				return controller.next();
			} catch (e) {
				console.log("Command did not register" + module.name!);
				console.log(e);
				return controller.stop();
			}
		},
	};
}

export function optionsTransformer(ops: Array<SernOptionsData>) {
	return ops.map((el) =>
		el.autocomplete ? (({ command, ...el }) => el)(el) : el
	);
}

export const CommandTypeRaw = {
	[CommandType.Both]: ApplicationCommandType.ChatInput,
	[CommandType.MenuMsg]: ApplicationCommandType.Message,
	[CommandType.MenuUser]: ApplicationCommandType.User,
	[CommandType.Slash]: ApplicationCommandType.ChatInput,
} as const;

interface PublishOptions {
	guildIds: string[];
	defaultMemberPermissions: PermissionResolvable | null;
	dmPermission: boolean;
}
