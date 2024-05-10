import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { cooldown, publish } from "#plugins";
import { slashCommand, require, cutText } from "#utils";
import type { Plugin } from "typings";
import { PluginList } from "#constants";

export default slashCommand({
    description: "View sern plugins",
    options: [
        {
            name: "plugin",
            description: "The plugin to view",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
            command: {
                onEvent: [],
                async execute(ctx) {
                    const plugins = require(PluginList) as Plugin[];

                    const focus = ctx.options.getFocused();
                    if (!plugins.length)
                        return ctx.respond([{ name: "No plugins found", value: "" }]);

                    const filtered = plugins.filter((p) =>
                        p.name.toLowerCase().includes(focus.toLowerCase()),
                    );

                    return ctx.respond(
                        filtered.map((p) => ({
                            name: p.name,
                            value: p.link,
                        })),
                    );
                },
            },
        },
    ],
    plugins: [
        publish(),
        cooldown.add([["user", "1/10"]], ({ seconds, context }) =>
            context.reply({
                content: `You gotta chill for ${seconds} seconds`,
                ephemeral: true,
            }),
        ),
    ],
    async execute(ctx, [, options]) {
        const plugins = require(PluginList) as Plugin[];

        if (!plugins.length) return ctx.reply("Plugins are uncached, contact Evo!");

        const url = options.getString("plugin", true);
        const plugin = plugins.find((p) => p.link === url);

        if (!plugin) {
            return ctx.reply(`No plugin found at this [link](<${url}>)`);
        }

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTimestamp()
            .setTitle(plugin.name)
            .setURL(plugin.link)
            .setFields(
                {
                    name: "Description",
                    value: plugin.description,
                },
                {
                    name: "Version",
                    value: plugin.version,
                },
                {
                    name: "Author",
                    value: plugin.author.map(parseAuthor).join("\n"),
                },
                {
                    name: "Example",
                    value: plugin.example,
                },
            );

        return ctx.reply({
            embeds: [embed],
        });
    },
});

function parseAuthor(s: string) {
    let [ghAuthor, discordAuthor] = s.split(" ");
    ghAuthor = ghAuthor.replace("@", "");
    const url = `https://github.com/${ghAuthor}`;
    return `[${ghAuthor}](${url}) ${discordAuthor}`;
}

export interface Data {
    name: string;
    download_url: string;
    rawData: string;
}
