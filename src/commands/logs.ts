import { slashCommand } from "../utils/composable/slashCommand.js";
import { readFile } from "fs/promises";
import path from "path";
import type { Context, ReplyOptions } from "@sern/handler";
import { ownerOnly, publish } from "#plugins";
import * as fs from "fs";
import { Attachment, AttachmentBuilder } from "discord.js";

async function ephemeral(ctx: Context, options : ReplyOptions) {
	const resolvedOptions = typeof options == 'string' ? { content: options } : options
	await ctx.interaction.editReply({ ...resolvedOptions})
}

export default slashCommand({
	plugins: [publish(), ownerOnly()],
	execute: async (ctx, args) => {
		try {
			const controller = new AbortController();
			const logPath = path.join(process.cwd(), "error.log")
			const readHandle = readFile(logPath, { signal: controller.signal })
			await ctx.interaction.deferReply({ ephemeral: true })
			if(!fs.existsSync(logPath)) {
				controller.abort()
			}
			const log = await readHandle
			await ephemeral(ctx, {
				files: [new AttachmentBuilder(log).setName("error.log")]
			})
		} catch (e) {
			await ephemeral(ctx,"Couldn't find log. In dev mode?")
		}
	}
})