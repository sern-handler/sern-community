// import type { SernLogger } from "./logger";
// import { readdir } from "fs/promises";
// import path from "path";
// import type { Client } from "discord.js";
// import type { ModuleManager } from "@sern/handler";
// import type { ModuleStore } from "@sern/handler";
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
// 		private moduleStore: ModuleStore
// 	) {
// 		this
// 			.sync()
// 			.catch((e) => logger.error({ message: e ?? "Something went wrong with syncing" }));
// 	}
//
// 	private async sync() {
// 		this.logger.info({ message: "Syncing commands" });
// 		for await
// 			(const p of getFiles(this.commandsPath)) {
//
// 		}
//
// 	}
// }
