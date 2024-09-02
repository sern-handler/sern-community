import { commandModule, CommandType } from "@sern/handler";
import { EmbedBuilder } from "discord.js";
import { inspect } from "util";
import { Evo, Seren, Mina } from "#constants";

export default commandModule({
    type: CommandType.Text,
    description: "Eval something",
    execute: async (ctx) => {
        if (![Evo, Seren, Mina].includes(ctx.user.id)) return;

        let code: string[] | string = ctx.options;

        code = code.join(" ") as string;
        if (code.includes("await")) {
            const ar = code.split(";");
            const last = ar.pop();
            code = `(async () => {\n${ar.join(";\n")}\nreturn ${last?.trim() ?? " "}\n\n})();`;
        }
        const { channel, guild, client, user, member, message: msg } = ctx;
        if (
            ["TOKEN", "process.env", "token"].some((e) => code.includes(e)) &&
            ctx.user.id !== "697795666373640213"
        )
            return ctx.message.react("❌");

        let result: unknown | string;

        try {
            result = eval(code);
        } catch (error) {
            result = error;
        }
        if (result instanceof Promise)
            result = await result.catch((e: Error) => new Error(e.message));
        if (typeof result !== "string") {
            result = inspect(result, {
                depth: 0,
            });
        }

        result = "```js\n" + result + "\n```";

        if ((result as string).length > 2000) {
            channel!.send("Result is too long to send");
        }
        ctx.channel!.send({ content: result as string });
    },
});

function text() {
    const obj = [
        {
            name: `[CLI](https://github.com/sern-handler/cli):`,
            value: `\` - \` Updated templates for v2`,
        },
        {
            name: `[@sern/handler](https://www.npmjs.com/package/@sern/handler):`,
            value: `\` - \` Read blog (I wrote everything here) https://sern.dev/blog`,
        },
        {
            name: `[Website](https://sern.dev)`,
            value: `\` - \` Blog 2.0`,
        },
        // {
        // 	name: `[Community bot](https://github.com/sern-handler/sern-community)`,
        // 	value: `\` - \` Documentation at your hands in this server!\n\` - \` Autocompletes\n\` - \` Tag System\n\` - \` Features all the plugins in [this repository](https://github.com/sern-handler/awesome-plugins)`,
        // },
    ];
    return obj.map(({ name, value }) => `**${name}**\n${value}`).join("\n\n");
}
