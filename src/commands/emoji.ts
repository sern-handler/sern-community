import { commandModule, CommandType, Context } from "@sern/handler";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	Attachment,
	ButtonBuilder,
	Message,
	Snowflake,
	TextChannel
} from "discord.js";
import { publish } from "../plugins/publish.js";
import { Resolver } from "../Resolver.js";
import { fetch } from "undici";

export default commandModule({
	type: CommandType.Slash,
	plugins: [publish({ dmPermission: false })],
	options: [
		{
			name: "submit",
			type: ApplicationCommandOptionType.Subcommand,
			description: "submit an emoji",
			options: [
				{
					name: "attachment",
					type: ApplicationCommandOptionType.Attachment,
					description: "An attachment for submission",
					required: false,
				},
				{
					name: "url",
					type: ApplicationCommandOptionType.String,
					description: "URL for submission",
					required: false,
				},
			],
		},
	],
	async execute(ctx, [, args]) {
		const command = args.getSubcommand();

		await ctx.interaction.deferReply({ ephemeral: true });
		const send = sendTo('942873612464050288');
		switch (command) {
			case "submit": {
				const attachment = args.getAttachment("attachment");
				const urlString = args.getString("url");
				if (attachment) {
					const isValidAttachment = verify(attachment,
						(a) => a.size <= 256_000,
						a => a.contentType?.startsWith('image/') || false,
						(a) =>
							["image/png", "image/jpg", "image/gif"].includes(
								a.contentType ??
								"Something that is not png or jpg when contentType is null"
							)
						);
					if (!isValidAttachment) {
						return ctx.interaction.editReply({
							content:
								"Your attachment is not in valid format. Please submit something else",
						});
					}
					return ctx.interaction.editReply({
						 content:
						 	 "Thanks for submitting. Your attachment will now be reviewed"
					}).then(m => send(m, attachment));
				}
				else if (urlString) {
					const url = new Resolver(urlString, ctx.interaction).url;
					if (!url || !(await validImage(url)))
						return ctx.interaction.editReply({
							content: "This URL is invalid!",
						});
					return ctx.interaction.editReply({
						content:
							"Thanks for submitting. Your url will now be reviewed"
					});
				}

				return ctx.interaction.editReply({
					content: "You gotta provide either attachment or a url mate!",
				});
			}
		}
	},
});

function verify<T>(
	attachment: T,
	...conditions: ((attachment: T) => boolean)[]
){
	return conditions.reduce(
		(partial, func) => {
			return func(attachment) && partial
		},
		true
	);
}

async function validImage(url: URL) {
	return fetch(url.toString())
		.then(req => req.blob())
		.then(req => req.type.startsWith("image/"))
		.catch(() => false);
}

function sendTo(channelId: Snowflake) {
	return async function provider(context: Message, attachment: Attachment) {
		const channel = await context.client.channels.fetch(channelId);
		await (channel as TextChannel).send({
			content: 'Bruddas, please review, thank you.',
			files : [attachment],
			components : [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder().setCustomId(channelId + '$' + context.id),
						new ButtonBuilder().setCustomId(channelId + '$' + context.id),
					)
			]
		})
	}
}