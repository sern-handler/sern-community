import {
    ActionRowBuilder,
    APIButtonComponentWithCustomId,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
    GuildMember,
    InteractionCollector,
    InteractionResponse,
    User,
} from "discord.js";
import { Timestamp } from "./Timestamp.js";

export class TicTacToe {
    public constructor(public readonly time?: number) {
        this.time ??= 60_000;
    }

    readonly #X = `<:TTTX:879637390908620831>`;
    readonly #O = `<:TTTO:879637486492594217>`;
    readonly #Empty = `<:thevoid:986649133110685726>`;
    readonly #WinConditions: Combination[][] = [
        ["1-1", "1-2", "1-3"],
        ["2-1", "2-2", "2-3"],
        ["3-1", "3-2", "3-3"],
        ["1-1", "2-1", "3-1"],
        ["1-2", "2-2", "3-2"],
        ["1-3", "2-3", "3-3"],
        ["1-1", "2-2", "3-3"],
        ["1-3", "2-2", "3-1"],
    ];

    public sanityChecks(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.getMember("opponent") as GuildMember;
        if (!member) return void interaction.reply("Member not in server!");
        const { user } = member;

        if (user.id === interaction.user.id)
            return void interaction.reply(`Don't dare to play with yourself idiot`);
        return user;
    }

    public createCollector(response: InteractionResponse<boolean>, player: User, opponent: User) {
        return response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => [player.id, opponent.id].includes(i.user.id),
            time: this.time,
        });
    }

    public HumanGame(
        interaction: ChatInputCommandInteraction,
        collector: InteractionCollector<ButtonInteraction<CacheType>>,
        chance: User,
        mark: "X" | "O",
        content: string,
        pieces: ActionRowBuilder<ButtonBuilder>[],
        opponent: User
    ) {
        collector.on("collect", async (i) => {
            if (chance.id !== i.user.id) {
                return void (await i.reply({
                    content: "Not your chance mister!",
                    ephemeral: true,
                }));
            }
            const { customId } = i;
            this.mark(pieces, customId, mark);

            const possibleWinner = this.computeWin(pieces);
            if (possibleWinner.winner) {
                this.disableAllButtons(pieces, possibleWinner.winner, possibleWinner.winPieces);
                collector.stop(`Finished!`);

                return void (await i.update({
                    content: `${chance} won! GG`,
                    components: pieces,
                }));
            }

            chance = chance.id === interaction.user.id ? opponent : interaction.user;
            mark = mark === "X" ? "O" : "X";

            collector.resetTimer();

            const disabled = this.getDisabled(pieces);

            content =
                disabled === 9
                    ? "Game ended in tie, what a shame!"
                    : `Let the game begin!\n${interaction.user} vs ${opponent}\n\n> Current Chance: ${chance} [${mark}]` +
                      `\nTime ends ${new Timestamp(Date.now() + this.time!).getRelativeTime()}`;

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
            this.disableAllButtons(pieces);
            await interaction.editReply({
                content: `Fine, I ain't playing anymore, won't wait for afk losers`,
                components: pieces,
            });
        });
    }

    public AIGame(
        interaction: ChatInputCommandInteraction,
        collector: InteractionCollector<ButtonInteraction<CacheType>>,
        chance: User,
        mark: "X" | "O",
        content: string,
        pieces: ActionRowBuilder<ButtonBuilder>[],
        opponent: User
    ) {
        collector.on("collect", async (i) => {
            if (chance.id !== i.user.id) {
                return void (await i.reply({
                    content: "Not your chance mister!",
                    ephemeral: true,
                }));
            }
            const { customId } = i;
            this.mark(pieces, customId, mark);

            const possibleWinner = this.computeWin(pieces);
            if (possibleWinner.winner) {
                this.disableAllButtons(pieces, possibleWinner.winner, possibleWinner.winPieces);
                collector.stop(`Finished!`);

                return void (await i.update({
                    content: `${chance} won! GG`,
                    components: pieces,
                }));
            }

            chance = chance.id === interaction.user.id ? opponent : interaction.user;
            mark = mark === "X" ? "O" : "X";

            collector.resetTimer();

            const disabled = this.getDisabled(pieces);

            content =
                disabled === 9
                    ? "Game ended in tie, what a shame!"
                    : `Let the game begin!\n${interaction.user} vs ${opponent}\n\n> Current Chance: ${chance} [${mark}]` +
                      `\nTime ends ${new Timestamp(Date.now() + this.time!).getRelativeTime()}`;

            await i.update({
                content,
                components: pieces,
            });

            if (disabled === 9) collector.stop("Finished!");

            const bestMove = this.aiMove(pieces);

            if (bestMove) {
                this.mark(pieces, bestMove, mark);

                const possibleWinner = this.computeWin(pieces);
                if (possibleWinner.winner) {
                    this.disableAllButtons(pieces, possibleWinner.winner, possibleWinner.winPieces);
                    collector.stop(`Finished!`);

                    return void (await i.editReply({
                        content: `Imagine losing to a bot bruh`,
                        components: pieces,
                    }));
                }

                mark = mark === "X" ? "O" : "X";
                chance = interaction.user;
                content =
                    `${interaction.user} vs ${opponent}\n\n> Current Chance: ${interaction.user} [${mark}]` +
                    `\nTime ends ${new Timestamp(Date.now() + this.time!).getRelativeTime()}`;
                collector.resetTimer();

                await i.editReply({
                    content,
                    components: pieces,
                });
            }
        });

        collector.on("ignore", async (i) => {
            await i.reply({
                content: `You ain't playin my man, get rekt`,
                ephemeral: true,
            });
        });

        collector.on("end", async (_, r) => {
            if (r === "Finished!") return;
            this.disableAllButtons(pieces);
            await interaction.editReply({
                content: `Fine, I ain't playing anymore, won't wait for afk losers`,
                components: pieces,
            });
        });
    }

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
                    .setCustomId(`${i + 1}-${j + 1}`)
                    .setEmoji(this.#Empty)
                    .setStyle(ButtonStyle.Secondary)
            );
    }

    public buildRows() {
        return Array<ActionRowBuilder>(3)
            .fill(new ActionRowBuilder())
            .map((_, i) =>
                new ActionRowBuilder<ButtonBuilder>().setComponents(this.buildButtons(i))
            );
    }

    public mark(rows: ActionRowBuilder<ButtonBuilder>[], id: string, mark: "X" | "O") {
        for (const row of rows) {
            for (const button of row.components) {
                if ((button.data as APIButtonComponentWithCustomId).custom_id === id) {
                    button.setEmoji(mark === "O" ? this.#O : this.#X);
                    button.setDisabled();
                }
            }
        }
        return rows;
    }

    public dummyMark(
        rows: ActionRowBuilder<ButtonBuilder>[],
        id: string,
        mark: "X" | "O" | "Empty"
    ) {
        // deep copy the array
        const rowsCopy = rows.map((r) =>
            new ActionRowBuilder<ButtonBuilder>().setComponents(r.components)
        );
        for (const row of rowsCopy) {
            for (const button of row.components) {
                if ((button.data as APIButtonComponentWithCustomId).custom_id === id) {
                    button.setEmoji(mark === "O" ? this.#O : mark === "X" ? this.#X : this.#Empty);
                    if (mark !== "Empty") {
                        button.setDisabled();
                    } else {
                        button.setDisabled(false);
                    }
                }
            }
        }
        return rowsCopy;
    }

    public computeWin(pieces: ActionRowBuilder<ButtonBuilder>[]) {
        const markedX: Combination[] = [];
        const markedO: Combination[] = [];
        let winPieces: Combination[] = [];
        let winner: "X" | "O" | undefined;

        for (const row of pieces) {
            for (const piece of row.components) {
                if (!piece.data.disabled) continue;
                const { emoji } = piece.data;
                if (!emoji) continue;
                const emojiString = `<:${emoji.name}:${emoji.id}>`;
                const id = (piece.data as APIButtonComponentWithCustomId).custom_id as Combination;
                if (emojiString === this.#X) markedX.push(id);
                else markedO.push(id);
            }
        }
        if (this.#WinConditions.find((win) => win.every((r) => markedX.includes(r)))) {
            winPieces = this.#WinConditions.find((win) => win.every((r) => markedX.includes(r)))!;
            winner = "X";
        }
        if (this.#WinConditions.find((win) => win.every((r) => markedO.includes(r)))) {
            winPieces = this.#WinConditions.find((win) => win.every((r) => markedO.includes(r)))!;
            winner = "O";
        }
        return { winner, winPieces };
    }

    public getEmpty(pieces: ActionRowBuilder<ButtonBuilder>[]) {
        let empty: Combination[] = [];
        for (const row of pieces) {
            for (const piece of row.components) {
                if (piece.data.disabled) continue;
                const { emoji } = piece.data;
                if (!emoji) continue;
                const emojiString = `<:${emoji.name}:${emoji.id}>`;
                const id = (piece.data as APIButtonComponentWithCustomId).custom_id as Combination;
                if (emojiString === this.#Empty) empty.push(id);
            }
        }
        return empty;
    }

    public evaluateBoard(pieces: ActionRowBuilder<ButtonBuilder>[]) {
        let { winner } = this.computeWin(pieces);
        const disabled = this.getDisabled(pieces);
        if (!winner) {
            if (disabled === 9) return 0;
            return;
        }
        return winner == "X" ? -1 : 1;
    }

    public minMax(pieces: ActionRowBuilder<ButtonBuilder>[], depth: number, isMaximizing: boolean) {
        const score = this.evaluateBoard(pieces);
        if (typeof score !== "undefined") return score;

        const maxDepth = Math.floor(Math.random() * (8 - 3) + 3);
        if (depth > maxDepth) return 0;

        if (isMaximizing) {
            const empty = this.getEmpty(pieces);
            let bestScore = Number.MIN_SAFE_INTEGER;
            for (const emptyId of empty) {
                const newPieces = this.dummyMark(pieces, emptyId, "O");
                bestScore = Math.max(bestScore, this.minMax(newPieces, depth + 1, false));
                this.dummyMark(pieces, emptyId, "Empty");
            }
            return bestScore;
        } else {
            const empty = this.getEmpty(pieces);
            let bestScore = Number.MAX_SAFE_INTEGER;
            for (const emptyId of empty) {
                const newPieces = this.dummyMark(pieces, emptyId, "X");
                bestScore = Math.min(bestScore, this.minMax(newPieces, depth + 1, true));
                this.dummyMark(pieces, emptyId, "Empty");
            }
            return bestScore;
        }
    }

    public aiMove(pieces: ActionRowBuilder<ButtonBuilder>[]) {
        let bestScore = Number.MIN_SAFE_INTEGER;
        let bestMove: Combination | undefined;
        const empty = this.getEmpty(pieces);
        for (const emptyId of empty) {
            this.dummyMark(pieces, emptyId, "O");
            const score = this.minMax(pieces, 0, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = emptyId;
            }
            this.dummyMark(pieces, emptyId, "Empty");
        }
        return bestMove;
    }

    public disableAllButtons(
        pieces: ActionRowBuilder<ButtonBuilder>[],
        winner?: "X" | "O",
        winPieces?: Combination[]
    ) {
        for (const row of pieces) {
            for (const piece of row.components) {
                if (winner && winPieces) {
                    const { emoji } = piece.data;
                    if (!emoji) continue;
                    const emojiString = `<:${emoji.name}:${emoji.id}>`;
                    const win = winner === "X" ? this.#X : this.#O;
                    if (
                        win === emojiString &&
                        winPieces.some((w) =>
                            w.includes((piece.data as APIButtonComponentWithCustomId).custom_id)
                        )
                    )
                        piece.setStyle(ButtonStyle.Success);
                }
                piece.setDisabled();
            }
        }
        return pieces;
    }
}

type Side = 1 | 2 | 3;
export type Combination = `${Side}-${Side}`;
