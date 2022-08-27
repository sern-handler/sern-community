import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType, Attachment } from "discord.js";

export default commandModule({
	type: CommandType.Slash,
	options: [
		{
			name: 'submit',
			type: ApplicationCommandOptionType.Subcommand,
			description: 'submit an emoji',
			options: [
				{
					name: 'attachment',
					type: ApplicationCommandOptionType.Attachment,
					description: 'an attachment for submission',
					required: true
				}
			]
		}
	],
	async execute(ctx, [, args]) {
		const command = args.getSubcommand();

		switch (command) {
			case 'submit' : {
				const attachment =  args.getAttachment('attachment', true)
				const verifyAttachment = validAttachment(attachment);
				const conditions = verifyAttachment(
					a => (a.width ?? 0) <= 256 && (a.height ?? 0) <= 256,
					a =>  ['png','jpg'].includes(a.contentType ?? 'Something that is not png or jpg when contentType is null')
				);
				if(conditions) {

				} else {
					await ctx.reply('Your attachment is not in valid format. Please submit something else')
				}
			}
		}
	}
})

function validAttachment(attachment: Attachment) {
	return (...conditions: ((attachment : Attachment) => boolean)[]) => {
		return conditions.reduce((partial, func) => func(attachment) && partial, true)
	}
}