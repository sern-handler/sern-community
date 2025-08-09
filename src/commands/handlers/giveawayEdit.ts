import { commandModule, CommandType } from "@sern/handler";
import { ownerIDs } from "#constants";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default commandModule({
    type: CommandType.Button,
    name: "edit",
    async execute(ctx) {
        // if (!ownerIDs.includes(ctx.user.id))
        //     return ctx.reply({
        //         ephemeral: true,
        //         content: `You cannot edit the giveaway because you are not one of the owners`,
        //     });
        
        const modal = new ModalBuilder()
        .setCustomId('giveawayEditModal')
        .setTitle('Edit Giveaway');

        const itemInput = new TextInputBuilder()
            .setCustomId('item')
            .setLabel('New Giveaway Item')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const timeInput = new TextInputBuilder()
            .setCustomId('time')
            .setLabel('New Time')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(itemInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput)
        );

        await ctx.showModal(modal);
    },
});
