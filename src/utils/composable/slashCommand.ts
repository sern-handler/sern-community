import {
    AnyCommandPlugin,
	BaseOptions,
	commandModule,
	CommandType,
	Context,
	SernSubCommandData,
	SernSubCommandGroupData,
	SlashOptions,
} from "@sern/handler";

export function slashCommand(data: {
	name?: string;
	description: string;
	plugins?: AnyCommandPlugin[];
	options?:
		| (SernSubCommandData | SernSubCommandGroupData | BaseOptions)[]
		| undefined;
	execute: (ctx: Context, args: ["slash", SlashOptions]) => any;
}) {
	//Weird fix for explicit undefined fields in an object
	const resolvedData = { type: CommandType.Slash, ...data } as const;
	return commandModule(resolvedData);
}
