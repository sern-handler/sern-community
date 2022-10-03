import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { publish } from "../../plugins/publish.js";
import { TicTacToe } from "../../utils/TicTacToe.js";
import { Timestamp } from "../../utils/Timestamp.js";

export default commandModule({
	type: CommandType.Slash,
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

		game.HumanGame(interaction, collector, chance, mark, content, pieces, user);
	},
});
