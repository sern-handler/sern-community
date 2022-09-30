import { commandModule, CommandType } from "@sern/handler";
import {
	ApplicationCommandOptionType,
	GuildMember,
	ComponentType,
} from "discord.js";
import { publish } from "../../plugins/publish.js";
import { TicTacToe } from "../../utils/TicTacToe.js";
import { Timestamp } from "../../utils/Timestamp.js";

export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
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

		const member = interaction.options.getMember("opponent") as GuildMember;
		if (!member) return interaction.reply("Member not in server!");
		const { user } = member;
		if (user.bot) return interaction.reply(`Can't play with bots bruh`);
		if (user.id === interaction.user.id) return interaction.reply(`Get lost!`);
		const game = new TicTacToe();
		let pieces = game.buildRows();

		let content =
			`Let the game begin!\n${interaction.user} vs ${user}\n\n> Current Chance: ${interaction.user} [X]` +
			`\nTime ends ${new Timestamp(Date.now() + 60_000).getRelativeTime()}`;

		const sent = await interaction.reply({
			content,
			components: pieces,
		});

		const collector = sent.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (i) => [interaction.user.id, user.id].includes(i.user.id),
			time: 60_000,
		});

		let chance = interaction.user;
		let mark: "X" | "O" = "X";

		collector.on("collect", async (i) => {
			if (chance.id !== i.user.id) {
				return void (await i.reply({
					content: "Not your chance mister!",
					ephemeral: true,
				}));
			}

			const { customId } = i;
			game.mark(pieces, customId, mark);

			const possibleWinner = game.computeWin(pieces);
			if (possibleWinner) {
				game.disableAllButtons(pieces, possibleWinner);
				collector.stop(`Finished!`);

				return void (await i.update({
					content: `${chance} won! GG`,
					components: pieces,
				}));
			}

			chance = chance.id === interaction.user.id ? user : interaction.user;
			mark = mark === "X" ? "O" : "X";

			collector.resetTimer();

			const disabled = game.getDisabled(pieces);

			disabled === 9
				? (content = "Game ended in tie, what a shame!")
				: (content =
						`Let the game begin!\n${interaction.user} vs ${user}\n\n> Current Chance: ${chance} [${mark}]` +
						`\nTime ends ${new Timestamp(
							Date.now() + 60_000
						).getRelativeTime()}`);

			await i.update({
				content,
				components: pieces,
			});
			if (disabled === 9) collector.stop("Finished!");
		});

		collector.on("ignore", async (i) => {
			await i.reply({
				content: `You ain't playin my man, get rekt`,
				ephemeral: true,
			});
		});

		collector.on("end", async (_, r) => {
			if (r === "Finished!") return;
			game.disableAllButtons(pieces);
			await interaction.editReply({
				content: `Fine, I ain't playing anymore, won't wait for afk losers`,
				components: pieces,
			});
		});
	},
});
