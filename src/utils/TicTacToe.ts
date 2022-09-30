import {
	ActionRowBuilder,
	APIButtonComponentWithCustomId,
	ButtonBuilder,
	ButtonStyle,
} from 'discord.js';

export class TicTacToe {
	readonly #X = `<:TTTX:879637390908620831>`;
	readonly #O = `<:TTTO:879637486492594217>`;
	readonly #Empty = `<:thevoid:986649133110685726>`;
	readonly #Matrix = this.generateMagicSquare(3);

	public getDisabled(pieces: ActionRowBuilder<ButtonBuilder>[]) {
		let disabled = 0;
		for (const row of pieces) {
			for (const piece of row.components) {
				if (piece.data.disabled) disabled++;
			}
		}
		return disabled;
	}

	public buildButtons(i: number) {
		return Array<ButtonBuilder>(3)
			.fill(new ButtonBuilder())
			.map((_, j) =>
				new ButtonBuilder()
					.setCustomId(`${this.#Matrix[i][j]}`)
					.setEmoji(this.#Empty)
					.setStyle(ButtonStyle.Secondary)
			);
	}

	public buildRows() {
		return Array<ActionRowBuilder>(3)
			.fill(new ActionRowBuilder())
			.map((_, i) =>
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					this.buildButtons(i)
				)
			);
	}

	public mark(
		rows: ActionRowBuilder<ButtonBuilder>[],
		id: string,
		mark: 'X' | 'O'
	) {
		for (const row of rows) {
			for (const button of row.components) {
				if ((button.data as APIButtonComponentWithCustomId).custom_id === id) {
					button.setEmoji(mark === 'O' ? this.#O : this.#X);
					button.setDisabled();
				}
			}
		}
		return rows;
	}

	public computeWin(
		pieces: ActionRowBuilder<ButtonBuilder>[]
	): 'X' | 'O' | undefined {
		const markedX: number[] = [];
		const markedO: number[] = [];
		let winner: 'X' | 'O' | undefined;

		for (const row of pieces) {
			for (const piece of row.components) {
				if (!piece.data.disabled) continue;
				const { emoji } = piece.data;
				if (!emoji) continue;
				const emojiString = `<:${emoji.name}:${emoji.id}>`;
				const id = Number(
					(piece.data as APIButtonComponentWithCustomId).custom_id
				);
				if (emojiString === this.#X) markedX.push(id);
				else markedO.push(id);
			}
		}
		const sum = (array: number[]) => array.reduce((a, b) => a + b, 0);
		if (sum(markedX) === 15) winner = 'X';
		if (sum(markedO) === 15) winner = 'O';
		return winner;
	}

	public disableAllButtons(
		pieces: ActionRowBuilder<ButtonBuilder>[],
		winner?: 'X' | 'O'
	) {
		for (const row of pieces) {
			for (const piece of row.components) {
				if (winner) {
					const { emoji } = piece.data;
					if (!emoji) continue;
					const emojiString = `<:${emoji.name}:${emoji.id}>`;
					const win = winner === 'X' ? this.#X : this.#O;
					if (win === emojiString) piece.setStyle(ButtonStyle.Success);
				}
				piece.setDisabled();
			}
		}
		return pieces;
	}

	public generateMagicSquare(n: number) {
		let i: number, j: number;
		i = Math.floor(n / 2);
		j = n - 1;
		let baseMatrix = new Array<number[]>(n)
			.fill([])
			.map((_) => new Array<number>(n));

		baseMatrix[i][j] = 1;

		for (let k = 2; k <= n * n; k++) {
			i -= 1;
			j += 1;

			if (i < 0 && j === n) {
				i = 0;
				j = n - 2;
			} else if (i < 0) {
				i = n - 1;
			} else if (j === n) {
				j = 0;
			}

			if (typeof baseMatrix[i][j] === 'number') {
				i += 1;
				j -= 2;
			}

			baseMatrix[i][j] = k;
		}
		return baseMatrix;
	}
}
