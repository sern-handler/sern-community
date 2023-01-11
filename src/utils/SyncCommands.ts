// import type { SernLogger } from "./Logger";
// import { readdir } from "fs/promises";
// import path from "path";
// import type { Client } from "discord.js";
// import { ApplicationCommandType, basename } from "discord.js";
// import type { BothCommand, CommandModule, ContextMenuMsg, ContextMenuUser, SlashCommand } from "@sern/handler";
// import { CommandType } from "@sern/handler";
//
// async function* getFiles(dir: string): AsyncGenerator<string> {
// 	const dirents = await readdir(dir, { withFileTypes: true });
// 	for (const dirent of dirents) {
// 		const res = path.resolve(dir, dirent.name);
// 		if (dirent.isDirectory()) {
// 			yield* getFiles(res);
// 		} else {
// 			yield res;
// 		}
// 	}
// }
//
// export class CommandSyncer {
// 	private commandsPath = "dist/src/commands";
//
// 	constructor(
// 		private logger: SernLogger,
// 		private client: Client,
// 		private scopedGuilds : string[] = []
// 	) {
// 		setTimeout(() => {
// 			this
// 				.sync()
// 				.catch((e) => logger.error({ message: e ?? "Something went wrong with syncing" }));
// 		}, 20_000)
// 	}
// 	private publishable(module: CommandModule) {
// 		const publishableTypes = (CommandType.Both | CommandType.CtxUser | CommandType.CtxMsg | CommandType.Slash)
// 		return ((publishableTypes & ~CommandType.Text) & module.type) != 0
// 	}
// 	private async handleSlashCommand(module: SlashCommand | BothCommand, resolvedName: string) {
// 		this.logger.debug({ message: `Checking if ${resolvedName} is already registered` });
// 		if (this.scopedGuilds.length) {
// 			for (const guildId of this.scopedGuilds) {
// 				const guild = await this.client.guilds.fetch(guildId).catch(() => null);
//
// 				if (!guild) throw new Error(`Found no Guild with id ${guildId}!`);
// 				console.log(guild.name)
// 				console.log(await guild.commands.fetch())
// 			}
// 		}
// 	}
// 	private handleContextMenus(module: ContextMenuUser | ContextMenuMsg, resolvedName: string) {
//
// 	}
// 	private async sync() {
// 		this.logger.info({ message: "Syncing commands" });
// 		for await(const path of getFiles(this.commandsPath)) {
// 			const module = await import("file:///"+path).then(imp => imp.default) as CommandModule; //i would retrieve from the module store, but its a little bugged since
// 			if(this.publishable(module)) {
// 				const resolvedName = module.name ?? basename(path).slice(0, -3)
// 				switch(module.type) {
// 					case CommandType.Both:
// 					case CommandType.Slash: {
// 						await this.handleSlashCommand(module, resolvedName)
// 					} break;
// 					case CommandType.CtxMsg:
// 					case CommandType.CtxUser: {
// 						this.handleContextMenus(module, resolvedName)
// 					} break;
// 				}
// 			}
// 		}
// 	}
// }
