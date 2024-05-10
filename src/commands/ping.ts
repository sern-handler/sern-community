import { publish } from "#plugins";
import { Timestamp, slashCommand } from "#utils";

export default slashCommand({
    plugins: [publish()],
    description: "Pong!",
    execute: async (context) => {
        const uptime = new Timestamp(context.client.readyTimestamp!);
        await context.reply(
            `Pong 🏓 \`${context.client.ws.ping}ms\`\nStarted running ${uptime.getRelativeTime()}`,
        );
    },
});
