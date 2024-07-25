import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { publish } from "#plugins";
import { fetch } from "undici";
import { readFileSync } from "fs";
import { slashCommand } from "#utils";

export default slashCommand({
    plugins: [publish()],
    description: "Get the time of a person.",
    options: [
        {
            name: "create",
            description: "Create the timezone where you are in the db.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "timezone",
                    description: "The timezone where you are located.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    command: {
                        execute: async (autocomplete) => {
                            const input = autocomplete.options.getFocused();
                            return autocomplete.respond(fuzz(input)).catch(() => null);
                        },
                    },
                },
            ],
        },
        {
            name: "get",
            description: "Get the time of a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            name: "delete",
            description: "Delete your entry in the database",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
    execute: async (ctx) => {
        const { options } = ctx;
        switch (options.getSubcommand()) {
            case "create": {
                const reqData = {
                    timezone: options.getString("timezone", true),
                    key: process.env.TIME_KEY!,
                    userid: ctx.user.id,
                };
                const request = await fetch("https://api.srizan.dev/sern/newTime", {
                    method: "POST",
                    body: JSON.stringify(reqData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).catch(() => null);

                const data = (await request?.json()) as Record<string, string>;

                if (!data)
                    return ctx.reply({
                        content: `Oops, the response errored out for some reason, you could try again...`,
                        ephemeral: true,
                    });

                return ctx.reply({
                    content: data?.ok ?? data?.error ?? "Something went wrong! Please try again",
                    ephemeral: true,
                });
            }
            case "get": {
                const option = options.getMember("user") as GuildMember;
                const request = await fetch(
                    `https://api.srizan.dev/sern/getTime?userid=${option.id}`,
                ).catch(() => null);

                const data = await request?.json() as APIResponse;

                if (!data)
                    return ctx.reply({
                        content: `Oopsies, I tried to connect to the API, but something went wrong. Try again, it should work`,
                        ephemeral: true,
                    });

                if (data.error)
                    return ctx.reply({
                        content: `${option}'s timezone data doesn't exist in the database!`,
                        ephemeral: true,
                    });

                const dateConvert = new Date().toLocaleString("en-GB", {
                    timeZone: data.timezone,
                    timeStyle: "full",
                    dateStyle: "medium",
                });

                return ctx.reply({
                    content: `Current time for ${option} is \`${dateConvert}\``,
                    allowedMentions: { parse: [] },
                });
            }
            case "delete": {
                const request = await fetch(
                    `https://api.srizan.dev/sern/deleteTime?userid=${ctx.user.id}&key=${process.env.TIME_KEY}`,
                    {
                        method: "DELETE",
                    },
                ).catch(() => null);
                const data = (await request?.json()) as Record<string, string>;

                if (!data)
                    return ctx.reply({
                        content: `Oops, the response errored out for some reason, you could try again...`,
                        ephemeral: true,
                    });

                return ctx.reply({
                    content: data?.ok ?? data?.error ?? "Something went wrong! Please try again",
                    ephemeral: true,
                });
            }
        }
    },
});

function fuzz(s: string, locale = false) {
    const path = `./time/${locale ? "countrylocalecodes" : "timezone"}.txt`;

    let zones: string[] = JSON.parse(`${readFileSync(path)}`);
    zones = zones.filter((choice) => choice.toLowerCase().includes(s.toLowerCase()));
    return zones.slice(0, 25).map((z) => ({ name: z, value: z }));
}

interface APIResponse {
    error?: string;
    timezone?: string;
}
