import {
    commandModule,
    CommandType,
    Context,
    SernSubCommandData,
    SernSubCommandGroupData,
    Plugin,
    SDT,
    SlashCommand
} from "@sern/handler";
import { ChatInputCommandInteraction } from "discord.js";

export function slashCommand(data: {
    name?: string;
    description: string;
    plugins?: Plugin[];
    options?: SlashCommand['options'];
    execute: (ctx: Context & { get options(): ChatInputCommandInteraction['options'] }, args: SDT) => any;
        
}) {
    //Weird fix for explicit undefined fields in an object
    const resolvedData = { type: CommandType.Slash, ...data } as const;
    return commandModule(resolvedData);
}

