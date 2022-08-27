import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType, Attachment } from "discord.js";
import { publish } from "../plugins/publish.js";
import { Resolver } from "../Resolver.js";

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

		switch (command) {
			case "submit": {
				const attachment = args.getAttachment("attachment");
				const urlString = args.getString("url");
				if (attachment) {
					const verifyAttachment = validAttachment(attachment);
					const conditions = verifyAttachment(
						(a) => (a.width ?? 0) <= 256 && (a.height ?? 0) <= 256,
						(a) =>
							["png", "jpg"].includes(
								a.contentType ??
									"Something that is not png or jpg when contentType is null"
							)
					);
					if (!conditions) {
						await ctx.interaction.editReply({
							content:
								"Your attachment is not in valid format. Please submit something else",
						});
					}
				} else if (urlString) {
					const url = new Resolver(urlString, ctx.interaction).url;
					if (!url || !(await validImage(url)))
						return ctx.interaction.editReply({
							content: "This URL is invalid!",
						});
				} else {
					return ctx.interaction.editReply({
						content: "You gotta provide either attachment or a url mate!",
					});
				}
			}
		}
	},
});

function validAttachment(attachment: Attachment) {
	return (...conditions: ((attachment: Attachment) => boolean)[]) => {
		return conditions.reduce(
			(partial, func) => func(attachment) && partial,
			true
		);
	};
}

async function validImage(url: URL) {
	const req = await fetch(url).catch(() => null);
	if (!req) return false;
	const buff = await req.blob().catch(() => null);
	if (!buff) return false;
	if (buff.type.startsWith("image/")) return true;
	return false;
}
