import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default commandModule({
    type: CommandType.Button,
    name: "emoji/accept",
    async execute(ctx) {
        if (!ownerIDs.includes(ctx.user.id))
            return ctx.reply({
                ephemeral: true,
                content: `You really thought the devs would allow you to accept the emoji?`,
            });

        const suggestedName = ctx.message.embeds[0].fields[0].value!;

        const modal = new ModalBuilder().setCustomId("emojiModal").setTitle("Emoji Creation");

        const row = new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder() //
                .setCustomId("emoji/name")
                .setLabel("Emoji Name")
                .setMinLength(2)
                .setMaxLength(32)
                .setPlaceholder("Name of the emoji")
                .setRequired()
                .setStyle(TextInputStyle.Short)
                .setValue(suggestedName),
        );
        modal.setComponents(row);

        await ctx.showModal(modal);
    },
});
