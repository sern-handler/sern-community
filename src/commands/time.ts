import { commandModule, CommandType, Context } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { publish } from "../plugins/publish.js";
import { fetch } from "undici";
import { readFileSync } from "fs";
export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
	description: "Get the time of a person.",
	options: [
		{
			name: "create",
			description: "Create the timezone where you are in the db.",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "timezone",
					description: "The timezone where you are located.",
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: true,
					command: {
						onEvent: [],
						execute: async (autocomplete) => {
							const focusedValue = autocomplete.options.getFocused()
							let choices = JSON.parse(String(readFileSync('./timezone.txt'))) as Array<string>
							choices = choices.filter(choice => choice.toString().toLowerCase().split("/").join("-").startsWith(focusedValue))
							choices = choices.slice(0,25)
							await autocomplete.respond(
								choices.map(choice => ({ name: choice.toString().toLowerCase().split("/").join("-"), value: choice })),
							);
						}
					}
				}
			]
		}
	],
	execute: async (ctx: Context, [, options]) => {
		
		switch(options.getSubcommand()) {
			case 'create': {
				const data = {
					name: ctx.user.username,
					timezone: options.getString('timezone', true),
					key: process.env.TIME_KEY,
					userid: ctx.user.id
				}
				const req = (await fetch('https://api.srizan.ml/sern/newTime', {
					method: 'POST',
					body: JSON.stringify(data)
				})).body
				await ctx.reply({content: `Your timezone was created succesfully!\nResponse from api.srizan.ml: ${JSON.stringify(req)}`, ephemeral: true})
			}
		}
	},
});
