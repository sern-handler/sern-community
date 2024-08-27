import { ApplicationCommandOptionType } from "discord.js";
import { publish } from "#plugins";
import { slashCommand, Timestamp, TicTacToe } from "#utils";

export default slashCommand({
    plugins: [publish({ dmPermission: false })],
    options: [
        {
            name: "opponent",
            description: "Opponent you would like to play with",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    description: "Lets play a game of tic tac toe!",
    async execute(ctx) {
        const { interaction } = ctx;

        const game = new TicTacToe();
        const user = game.sanityChecks(interaction);
        if (!user) return;

        let pieces = game.buildRows();

        let content =
            `Let the game begin!\n${interaction.user} vs ${user}\n\n> Current Chance: ${interaction.user} [X]` +
            `\nTime ends ${new Timestamp(Date.now() + 60_000).getRelativeTime()}`;

        const sent = await interaction.reply({
            content,
            components: pieces,
        });

        const collector = game.createCollector(sent, interaction.user, user);

        let chance = interaction.user;
        let mark: "X" | "O" = "X";

        if (user.bot) {
            game.AIGame(interaction, collector, chance, mark, content, pieces, user);
        } else {
            game.HumanGame(interaction, collector, chance, mark, content, pieces, user);
        }
    },
});
