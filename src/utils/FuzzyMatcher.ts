import type { Message, User } from "discord.js";
import { findBestMatch } from "string-similarity";
import type { TagData } from "../types/index.js";

export class FuzzyMatcher {
	public constructor(private readonly message: Message, private readonly tags: TagData[]) {}

	readonly #regex = /<@!?(?<id>\d{17,20})>/g;

	private get cleanContent(): string {
		return this.message.content.replace(this.#regex, "");
	}

	public get mentionedUser(): User | undefined {
		return this.message.mentions.users.first();
	}

	public fuzzyMatch() {
		const keywords = this.tags.flatMap((t) => t.keywords).map((k) => k.toLowerCase());
		const matches = findBestMatch(this.cleanContent.toLowerCase(), keywords);

		if (matches.bestMatch.rating < 0.4) return null;
		const words = this.cleanContent.toLowerCase().split(" ");

		const firstMatchedTag = this.tags.find((t) => t.keywords.includes(matches.bestMatch.target));
		if (!firstMatchedTag) return null;

		const keyword = firstMatchedTag.keywords.find((k) => {
			return k === matches.bestMatch.target;
		});

		if (!keyword) return null;
		const splitted = keyword.toLowerCase().split(" ");

		const Confidence = this.checkArray(words, splitted);

		const final = (Confidence * 2 + matches.bestMatch.rating) / 3; // weighted average
		return {
			tag: firstMatchedTag,
			confidence: final,
		};
	}

	private checkArray(toCheck: string[], toMatch: string[]) {
		const booleans: boolean[] = [];
		for (const word of toMatch) {
			const check = findBestMatch(word, toCheck);
			if (check.bestMatch.rating > 0.85) booleans.push(true);
			else booleans.push(false);
		}
		return booleans.filter(Boolean).length / booleans.length;
	}
}
