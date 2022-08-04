import type { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, Message } from "discord.js";

export function Paginate() {
	const __embeds = [] as EmbedBuilder[];
	let cur = 0;
	let traverser: [ButtonBuilder, ButtonBuilder];
	let message: Message;
	return {
		add(...embeds: EmbedBuilder[]) {
			__embeds.push(...embeds);
			return this;
		},
		setTraverser(tr: [ButtonBuilder, ButtonBuilder]) {
			traverser = tr;
		},
		setMessage(_message: Message) {
			message = _message;
		},
		async next() {
			cur++;
			if (cur >= __embeds.length) {
				cur = 0;
			}
			await message.edit(this.components());
		},
		async back() {
			cur--;
			if (cur <= -__embeds.length) {
				cur = 0;
			}
			await message.edit(this.components());
		},
		at(num: number) {
			return __embeds.at(num);
		},
		components() {
			return {
				embeds: [__embeds.at(cur)!],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						traverser[0],
						traverser[1]
					),
				],
			};
		},
	};
}
