import { writeFileSync } from "fs";
import { ownerOnly, publish } from "#plugins";
import { Evo, PluginList } from "#constants";
import { slashCommand } from "#utils";
import type { Plugin } from "typings";

export default slashCommand({
    plugins: [
        publish({ dmPermission: false,
                  defaultMemberPermissions: ["Administrator"], }),
        ownerOnly([Evo]),
    ],
    description: "refresh plugins cache",
    async execute(ctx) {
        await ctx.interaction.deferReply({ ephemeral: true });
        const size = await cp();
        if (!size) return ctx.interaction.editReply({ content: "Fetch failed!" });
        return ctx.interaction.editReply({
            content: `Refreshed ${size} Plugins!`,
        });
    },
});

/**
 * Downloads the plugin list from github and writes it to the cache
 * @returns {Promise<number | null>} The number of plugins fetched
 */
export async function cp(): Promise<number | null> {
    const link = `https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/pluginlist.json`;
    const resp = await fetch(link).catch(() => null);
    if (!resp) return null;
    const dataArray = (await resp.json()) as Plugin[];

    writeFileSync(PluginList, JSON.stringify(dataArray, null, 2), { flag: "w" });
    return dataArray.length;
}
