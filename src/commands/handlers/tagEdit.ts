import { commandModule, CommandType } from "@sern/handler";
import { writeFileSync } from "fs";
import { createRequire } from "module";
import type { TagData } from "../../types";
const require = createRequire(import.meta.url);

export default commandModule({
	type: CommandType.Modal,
	name: "@sern/tag/edit",
	description: "Edition of tag",
	async execute(ctx) {
		const tagName = ctx.fields.getTextInputValue("tag-name");
		const tagContent = ctx.fields.getTextInputValue("tag-content");
		const keywords = ctx.fields.getTextInputValue("tag-keywords");

		const tag: TagData = {
			name: tagName,
			content: tagContent,
			keywords: keywords
				? keywords
						.trim()
						.split(",")
						.map((c) => c.trim())
						.filter((c) => !!c.length)
				: [],
		};
		const filePath = `./tags.json`;
		const file: TagData[] = require(`${process.cwd()}/tags.json`);
		const oldTag = file.find(
			(t) => t.name === (ctx.user.data as { tag: string }).tag
		)!;

		const similarKeywords = file.filter(
			(t) =>
				t.keywords.some((k) => tag.keywords.includes(k)) &&
				t.name !== oldTag.name &&
				t.content !== oldTag.content
		);
		if (similarKeywords.length) {
			return ctx.reply(
				`Tag __${tagName}__ has similar keywords to __${similarKeywords
					.map((t) => t.name)
					.join(", ")}__`
			);
		}

		file[file.findIndex((t) => t.name === ctx.user.data)] = tag;
		writeFileSync(filePath, JSON.stringify(file, null, 2));

		return ctx.reply({
			content: `Tag __${tagName}__ edited!`,
			ephemeral: false,
		});
	},
});
