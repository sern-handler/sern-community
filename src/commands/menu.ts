import {
    ActionRowBuilder,
    Collection,
    Role,
    TextChannel,
    StringSelectMenuBuilder,
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
} from "discord.js";
import { ownerOnly, publish } from "#plugins";
import { Resolver, slashCommand } from "#utils";

export default slashCommand({
    plugins: [ownerOnly(), publish()],
    description: "Select Menu Role",
    options: [
        {
            name: "channel",
            type: ApplicationCommandOptionType.Channel,
            description: "The channel to send the message to",
            channel_types: [ChannelType.GuildText],
            required: true,
        },
        {
            name: "role",
            type: ApplicationCommandOptionType.String,
            description: "The roles to attach (upto 25)",
            required: true,
        },
        {
            name: "message",
            type: ApplicationCommandOptionType.String,
            description: "The message to send",
            required: true,
        },
    ],
    async execute(ctx) {
        const options = ctx.options;
        const channel = options.getChannel("channel", true) as TextChannel;
        const role = new Resolver(options.getString("role", true), ctx.interaction).roles;
        const message = options.getString("message", true);

        if (role.size > 25) return ctx.reply("Too many roles");

        const cdn = role.filter(
            (r) => r.managed || r.position > (ctx.guild?.members.me)!.roles.highest.position,
        ).size;
        if (cdn) {
            return ctx.reply(
                `Some roles are managed by integration or higher than my highest role.\nPlease try again`,
            );
        }
        await ctx.interaction.deferReply();
        const row = createMenu(channel, role);
        const embed = new EmbedBuilder()
            .setTitle(message)
            .setDescription(`Please select your roles below\nYou can select multiple roles`)
            .setColor(0xcc5279);
        await channel.send({
            embeds: [embed],
            components: [row],
        });
        await ctx.interaction.editReply("✅ Done!");
    },
});

function createMenu(channel: TextChannel, role: Collection<string, Role>) {
    if (!channel || !role) throw new Error("Missing channel or role");
    const menu = new StringSelectMenuBuilder()
        .setCustomId("role-menu")
        .setMaxValues(role.size)
        .setMinValues(0)
        .setPlaceholder("Pick some roles here!")
        .setOptions(
            role.map((r) => {
                return {
                    label: r.name,
                    value: r.id,
                };
            }),
        );
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(menu);
    return row;
}
