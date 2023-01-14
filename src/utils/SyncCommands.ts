import type { SernLogger } from "./Logger";
import { readdir } from "fs/promises";
import path from "path";
import type { APIApplicationCommandOption, Client } from "discord.js";
import { ApplicationCommandType, basename } from "discord.js";
import type {
	BothCommand,
	CommandModule,
	ContextMenuMsg,
	ContextMenuUser,
	SernOptionsData,
	SlashCommand,
} from "@sern/handler";
import { CommandType } from "@sern/handler";

async function* getFiles(dir: string): AsyncGenerator<string> {
	const dirents = await readdir(dir, { withFileTypes: true });
	for (const dirent of dirents) {
		const res = path.resolve(dir, dirent.name);
		if (dirent.isDirectory()) {
			yield* getFiles(res);
		} else {
			yield res;
		}
	}
}

export class CommandSyncer {
	private commandsPath = "dist/src/commands";

	constructor(
		private logger: SernLogger,
		private client: Client,
		private scopedGuilds: string[] = []
	) {
		setTimeout(() => {
			this.sync().catch((e) =>
				logger.error({ message: e ?? "Something went wrong with syncing" })
			);
		}, 20_000);
	}

	/** Returns true if a `CommandModule` is publishable */
	private publishable(module: CommandModule) {
		const publishableTypes =
			CommandType.Both |
			CommandType.CtxUser |
			CommandType.CtxMsg |
			CommandType.Slash;
		return (publishableTypes & ~CommandType.Text & module.type) != 0;
	}

	/** Handles a slash command module. */
	private async handleSlashCommand(
		module: SlashCommand | BothCommand,
		resolvedName: string
	) {
		this.logger.debug({
			message: `Checking if ${resolvedName} is already registered`,
		});
		if (this.scopedGuilds.length) {
			for (const guildId of this.scopedGuilds) {
				const guild = await this.client.guilds.fetch(guildId).catch(() => null);

				if (!guild) throw new Error(`Found no Guild with id ${guildId}!`);
				this.logger.debug({
					message: `Fetching (or retrieving from cache, if available) guild ${guild.name} (${guild.id}) commands...`,
				});

				const commands = await guild.commands.fetch();
				const registeredCommand = commands.find((e) => e.name === resolvedName);

				if (registeredCommand) {
					this.logger.debug({
						message: `Updating command ${resolvedName}...`,
					});
					await registeredCommand.edit({
						name: module.name,
						description: module.description,
						options: this.optionsTransformer(
							module.options ?? []
						) as APIApplicationCommandOption[],
						type: ApplicationCommandType.ChatInput,
					});

					this.logger.debug({ message: `Command ${resolvedName} updated` });
				} else {
					this.logger.debug({
						message: `Registering ${resolvedName} command.`,
					});

					await guild.commands.create({
						name: resolvedName,
						description: module.description ?? "..",
						type: ApplicationCommandType.ChatInput,
						options: this.optionsTransformer(
							module.options ?? []
						) as APIApplicationCommandOption[],
					});
					this.logger.debug({
						message: `Command ${resolvedName} registered to guild ${guild.name} (${guild.id})`,
					});
				}
			}
		} else {
			this.logger.debug({ message: `Fetching global commands.` });

			const commands = await this.client.application!.commands.fetch();
			const registeredCommand = commands.find((e) => e.name === resolvedName);
			if (registeredCommand) {
				this.logger.debug({
					message: `Updating global ${resolvedName} command.`,
				});

				await registeredCommand.edit({
					name: module.name,
					description: module.description,
					options: this.optionsTransformer(
						module.options ?? []
					) as APIApplicationCommandOption[],
					type: ApplicationCommandType.ChatInput,
				});

				this.logger.debug({
					message: `Command ${resolvedName} updated.`,
				});
			} else {
				this.logger.debug({
					message: `Registering global command ${resolvedName}.`,
				});

				await this.client.application!.commands.create({
					name: resolvedName,
					description: module.description ?? "..",
					type: ApplicationCommandType.ChatInput,
					options: this.optionsTransformer(
						module.options ?? []
					) as APIApplicationCommandOption[],
				});

				this.logger.debug({
					message: `Global command ${resolvedName} created.`,
				});
			}
		}
	}

	public optionsTransformer(ops: Array<SernOptionsData>) {
		return ops.map((el) =>
			el.autocomplete ? (({ command, ...el }) => el)(el) : el
		);
	}

	private handleContextMenus(
		module: ContextMenuUser | ContextMenuMsg,
		resolvedName: string
	) {}

	/** Syncs application commands */
	private async sync() {
		this.logger.info({ message: "Syncing commands" });
		for await (const path of getFiles(this.commandsPath)) {
			const module = (await import("file:///" + path).then(
				(imp) => imp.default
			)) as CommandModule; //i would retrieve from the module store, but its a little bugged since
			if (this.publishable(module)) {
				const resolvedName = module.name ?? basename(path).slice(0, -3);
				switch (module.type) {
					case CommandType.Both:
					case CommandType.Slash:
						{
							await this.handleSlashCommand(module, resolvedName);
						}
						break;
					case CommandType.CtxMsg:
					case CommandType.CtxUser:
						{
							this.handleContextMenus(module, resolvedName);
						}
						break;
				}
			}
		}
	}
}
