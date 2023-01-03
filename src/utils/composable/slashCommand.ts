import {
	BaseOptions, commandModule, CommandModulePlugin, CommandType, Context, SernSubCommandData,
	SernSubCommandGroupData, SlashOptions } from "@sern/handler";



export function slashCommand(
	name = undefined,
	plugins: CommandModulePlugin<CommandType.Slash>[],
	options: (SernSubCommandData | SernSubCommandGroupData | BaseOptions)[] | undefined = undefined,
	execute: (ctx: Context, args: ['slash', SlashOptions]) => any
) {
	return commandModule({
		name,
		type: CommandType.Slash,
		options : options,
		plugins: [],
		execute : execute
	})
}