import { commandModule, CommandType, Context } from "@sern/handler";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
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
							const focusedValue = autocomplete.options.getFocused();
							let choices = JSON.parse(
								String(readFileSync("./time/timezone.txt"))
							) as string[];
							choices = choices.filter((choice) =>
								choice.startsWith(focusedValue)
							);
							choices = choices.slice(0, 25);

							await autocomplete.respond(
								choices.map((choice) => ({ name: choice, value: choice }))
							);
						},
					},
				},
			],
		},
		{
			name: "get",
			description: "Get the time of a user",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "locale",
					description: "The locale code to format the date",
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: true,
					command: {
						onEvent: [],
						execute: async (autocomplete) => {
							const focusedValue = autocomplete.options.getFocused();
							let choices = JSON.parse(
								String(readFileSync("./time/countrylocalecodes.txt"))
							) as Array<string>;
							choices = choices.filter((choice) =>
								choice.toString().startsWith(focusedValue)
							);
							choices = choices.slice(0, 25);
							await autocomplete.respond(
								choices.map((choice) => ({ name: choice, value: choice }))
							);
						},
					},
				},
				{
					name: "user",
					description: "The user",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: "delete",
			description: "Delete your entry in the database",
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
	execute: async (ctx: Context, [, options]) => {
		switch (options.getSubcommand()) {
			case "create":
				{
					try {
						let responseHasError;
						const reqData = {
							timezone: options.getString("timezone", true),
							key: process.env.TIME_KEY!,
							userid: ctx.user.id,
						};
						const request = await fetch("https://api.srizan.ml/sern/newTime", {
							method: "POST",
							body: JSON.stringify(reqData),
							headers: {
								"Content-Type": "application/json",
							},
						}).catch(() => (responseHasError = true));
						const data = await (request as unknown as Response).json();

						if (responseHasError)
							return await ctx.reply({
								content: `Oops, the response errored out for some reason, you could try again...`,
								ephemeral: true,
							});

						await ctx.reply({
							content:
								`Response from api.srizan.ml: ` +
								"`" +
								JSON.stringify(await data) +
								"`",
							ephemeral: true,
						});
					} catch (error) {
						await ctx.reply({
							content: `Something went wrong!\nTry again, Cloudflare Tunnels is sometimes buggy...`,
							ephemeral: true,
						});
					}
				}
				break;
			case "get": {
				try {
					let responseHasError;
					const option = options.getMember("user") as GuildMember;
					const request = await fetch(
						`https://api.srizan.ml/sern/getTime?userid=${option.id}`
					).catch(() => (responseHasError = true));

					const data = await (request as unknown as Response).json();
					const dateConvert = new Date().toLocaleString("bs-Cyrl-BA", {
						timeZone: data.timezone,
					});

					if (data.error === "you don't exist in the database")
						return await ctx.reply({
							content: `${option} doesn't exist in the database!`,
							ephemeral: true,
							allowedMentions: { parse: [] },
						});
					if (responseHasError)
						return await ctx.reply({
							content: `Oopsies, I tried to connect to the API, but something went wrong. Try again, it should work`,
							ephemeral: true,
						});
					await ctx.reply({
						content: `Current time for ${option}\n${dateConvert}`,
						ephemeral: true,
						allowedMentions: { parse: [] },
					});
				} catch (error) {
					await ctx.reply({
						content: `Something went wrong!\nTry again, Cloudflare Tunnels is sometimes buggy...`,
						ephemeral: true,
					});
				}
			}
			case "delete": {
				try {
					let responseHasError;
					const request = await fetch(
						`https://api.srizan.ml/sern/deleteTime?userid=${ctx.user.id}&key=${process.env.TIME_KEY}`,
						{
							method: "DELETE",
						}
					).catch(() => (responseHasError = true));
					const data = await (request as unknown as Response).json();

					if (responseHasError)
						return await ctx.reply({
							content: `Oops, the response errored out for some reason, you could try again...`,
							ephemeral: true,
						});

					await ctx.reply({
						content:
							`Response from api.srizan.ml: ` +
							"`" +
							JSON.stringify(await data) +
							"`",
						ephemeral: true,
					});
				} catch (error) {
					await ctx.reply({
						content: `Something went wrong!\nTry again, Cloudflare Tunnels is sometimes buggy...`,
						ephemeral: true,
					});
				}
			}
		}
	},
});