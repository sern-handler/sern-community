import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	Attachment,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	Message,
	Snowflake,
	TextChannel,
} from "discord.js";
import { fetch } from "undici";
import { cooldown, publish } from "#plugins";
import { Resolver, slashCommand } from "#utils";

export default slashCommand({
	description: "Submit an emoji",
	plugins: [publish({ dmPermission: false }), cooldown.add([["user", "1/15"]])],
	options: [
		{
			name: "submit",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Submit an emoji",
			options: [
				{
					name: "name",
					type: ApplicationCommandOptionType.String,
					description: "Name of the emoji",
					required: true,
				},
				{
					name: "attachment",
					type: ApplicationCommandOptionType.Attachment,
					description: "An attachment for submission (under 256KB)",
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
	execute: async (ctx, [, args]) => {
		const command = args.getSubcommand();

		await ctx.interaction.deferReply();
		switch (command) {
			case "submit": {
				const attachment = args.getAttachment("attachment");
				const urlString = args.getString("url");
				const name = args.getString("name", true);
				const send = sendTo("1014582281907753080", ctx.member as GuildMember, name);

				if (attachment) {
					const isValidAttachment = verify(
						attachment,
						(a) => a.size <= 256_000,
						(a) => a.contentType?.startsWith("image/") || false,
						(a) =>
							["image/png", "image/jpg", "image/gif"].includes(
								a.contentType ?? "Something that is not png or jpg when contentType is null"
							)
					);
					if (!isValidAttachment) {
						return ctx.interaction.editReply({
							content:
								"Your attachment is not in valid format or the size is over the limits of discord. Please submit something else",
						});
					}
					return ctx.interaction
						.editReply({
							content: "Thanks for submitting. Your emoji will now be reviewed",
						})
						.then((m) => send(m, attachment));
				} else if (urlString) {
					const url = new Resolver(urlString, ctx.interaction).url;
					if (!url || !(await validImage(url)))
						return ctx.interaction.editReply({
							content:
								"This URL is invalid or the size is over the limits of discord. Please submit something else",
						});
					return ctx.interaction
						.editReply({
							content: "Thanks for submitting. Your emoji will now be reviewed",
						})
						.then((m) => send(m, url));
				}

				return ctx.interaction.editReply({
					content: "You gotta provide either attachment or a url mate!",
				});
			}
		}
	},
});

function verify<T>(attachment: T, ...conditions: ((attachment: T) => boolean)[]) {
	return conditions.reduce((partial, func) => {
		return func(attachment) && partial;
	}, true);
}

async function validImage(url: URL) {
	return fetch(url.toString())
		.then((req) => req.blob())
		.then((req) => req.type.startsWith("image/") && req.size < 262144)
		.catch(() => false);
}

function sendTo(channelId: Snowflake, member: GuildMember, name: string) {
	async function provider(context: Message, payload: Attachment): Promise<void>;
	async function provider(context: Message, payload: URL): Promise<void>;
	async function provider(context: Message, payload: Attachment | URL) {
		const embed = new EmbedBuilder()
			.setColor("Yellow")
			.setTitle("Emoji Suggestion")
			.setAuthor({
				name: member.user.tag,
				iconURL: member.displayAvatarURL(),
				url: context.url,
			})
			.addFields(
				{
					name: "Suggested Name",
					value: name,
				},
				{
					name: "Status",
					value: "Pending Approval",
				}
			)
			.setTimestamp();

		const channel = (await context.client.channels.fetch(channelId)) as TextChannel;
		if (payload instanceof Attachment) {
			embed.setImage(`attachment://${payload.name}`);
		} else embed.setImage(payload.toString());

		await channel.send({
			content: "Bruddas, please review, thank you.",
			files: payload instanceof Attachment ? [payload] : [],
			embeds: [embed],
			components: [gimmeRow()],
		});
	}
	return provider;
}

function gimmeRow() {
	const accept = new ButtonBuilder()
		.setCustomId("emoji/accept")
		.setLabel("Accept")
		.setStyle(ButtonStyle.Success)
		.setEmoji("✅");
	const deny = new ButtonBuilder()
		.setCustomId("emoji/deny")
		.setLabel("Deny")
		.setStyle(ButtonStyle.Secondary)
		.setEmoji("❌");
	return new ActionRowBuilder<ButtonBuilder>().setComponents(deny, accept);
}
