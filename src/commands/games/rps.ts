import { commandModule, CommandType } from "@sern/handler";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	User,
} from "discord.js";
import { publish } from "../../plugins/publish.js";
export default commandModule({
	type: CommandType.Slash,
	plugins: [publish()],
	description: "wanna win in rps?",
	options: [
		{
			name: "user",
			description: "user you wanna play with",
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
	execute: async (context) => {
		const opponent =
			context.interaction.options.getUser("user") ?? context.client.user!;

		if (opponent.id === context.user.id)
			return context.reply(`Can't play with yourself dumb dumb`);

		const buttons = ["🪨|Rock", "📄|Paper", "✂|Scissors"].map((s) => {
			const [emoji, label] = s.split("|");
			return new ButtonBuilder()
				.setCustomId(label.toLowerCase())
				.setEmoji(emoji)
				.setLabel(label)
				.setStyle(ButtonStyle.Secondary);
		});

		const row = new ActionRowBuilder<ButtonBuilder>();

		let content = `${context.user} vs ${opponent}`;

		if (!opponent.bot) {
			content += `\n\n> Waiting for ${context.user.username}\n> Waiting for ${opponent.username}`;
		}

		const sent = await context.reply({
			content,
			components: [row.setComponents(buttons)],
		});

		const collector = sent.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (i) => [context.user.id, opponent.id].includes(i.user.id),
			time: 60_000,
		});

		collector.on("ignore", async (i) => {
			await i.reply({
				content: `Couldn't ignore you less`,
				ephemeral: true,
			});
		});

		let opponentChoice: Choice;
		let userChoice: Choice;

		const getResponses = (i: ButtonInteraction) => {
			opponentChoice ??= (
				opponent.bot
					? ["rock", "paper", "scissors"][(3 * Math.random()) | 0]
					: i.user.id === opponent.id
					? i.customId
					: undefined
			) as Choice;

			userChoice ??= (
				i.user.id === context.user.id ? i.customId : undefined
			) as Choice;
			return [userChoice, opponentChoice];
		};

		const computeResults = () => {
			content =
				content.split("\n")[0] +
				`\n\n> ${context.user.username} chose ${emoji[userChoice]}!` +
				`\n> ${opponent.username} chose ${emoji[opponentChoice]}!\n\nResults: `;

			const win = (user: User) => (content += `${user} wins! GG 🥳`);

			switch (`${userChoice}-${opponentChoice}` as Possibilities) {
				case "paper-rock":
				case "rock-scissors":
				case "scissors-paper":
					return win(context.user);
				case "paper-scissors":
				case "scissors-rock":
				case "rock-paper":
					return win(opponent);
				default:
					return (content += `oof! There was a tie!`);
			}
		};

		buttons.forEach((b) => b.setDisabled());

		collector.on("collect", async (i) => {
			collector.resetTimer();
			const choices = getResponses(i).filter(Boolean);

			if (!opponent.bot && choices.length !== 2) {
				content = content.replace(
					`> Waiting for ${i.user.username}`,
					`> ${i.user.username} has chosen!`
				);
				return void i.update(content);
			}
			collector.stop("finished");
			await i.update({
				content: computeResults(),
				components: [row.setComponents(buttons)],
			});
		});

		collector.on("end", async (_, r) => {
			if (r === "finished") return;
			await context.interaction.editReply({
				content: "Time up!",
				components: [row.setComponents(buttons)],
			}).catch(() => null);
		});
	},
});

type Choice = "rock" | "paper" | "scissors";

type Possibilities = `${Choice}-${Choice}`;

const emoji: Record<Choice, string> = {
	rock: "🪨",
	paper: "📄",
	scissors: "✂",
};
