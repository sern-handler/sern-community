import { commandModule, CommandType } from "@sern/handler";
import { existsSync, writeFileSync } from "fs";
import type { TagData } from "../../types";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default commandModule({
	type: CommandType.Modal,
	name: "@sern/tag/create",
	description: "Creation of tag",
	execute(ctx) {
		const tagName = ctx.fields.getTextInputValue("tag-name");
		const tagContent = ctx.fields.getTextInputValue("tag-content");
		const keywords = ctx.fields.getTextInputValue("tag-keywords");
		const tag: TagData = {
			name: tagName,
			content: tagContent,
			keywords: keywords
				? [
						...new Set(
							keywords
								.trim()
								.split(",")
								.map((c) => c.trim())
								.filter((c) => !!c.length)
						),
				  ]
				: [],
		};
		const filePath = `./tags.json`;
		if (!existsSync(filePath)) {
			const tags = [tag];
			writeFileSync(filePath, JSON.stringify(tags, null, 2));
		} else {
			const file: TagData[] = require(`${process.cwd()}/tags.json`);

			if (file.find((t) => t.name === tagName)) {
				return ctx.reply(`Tag __${tagName}__ already exists`);
			}

			const similarKeywords = file.filter((t) => t.keywords.some((k) => tag.keywords.includes(k)));
			if (similarKeywords.length) {
				return ctx.reply(
					`Tag __${tagName}__ has similar keywords to __${similarKeywords
						.map((t) => t.name)
						.join(", ")}__`
				);
			}
			file.push(tag);
			writeFileSync(filePath, JSON.stringify(file, null, 2));
		}
		return ctx.reply({
			content: `Tag __${tagName}__ created`,
		});
	},
});
