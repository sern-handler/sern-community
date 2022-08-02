import { commandModule, CommandType } from "@sern/handler";
import { writeFileSync } from "fs";
import type { TagData } from "./tagCreate";

export default commandModule({
	type: CommandType.Modal,
	name: '@sern/tag/edit',
	description: 'Edition of tag',
	async execute(ctx) {
		const tagName = ctx.fields.getTextInputValue('tag-name');
		const tagContent = ctx.fields.getTextInputValue('tag-content');
		const keywords = ctx.fields.getTextInputValue('tag-keywords');
		const tag: TagData = {
			name: tagName,
			content: tagContent,
			keywords: keywords ? keywords.trim().split(',').map(c => c.trim()).filter(c => !!c.length) : [],
		}
		const filePath = `./tags.json`;
		const file: TagData[] = require(`${process.cwd()}\\tags.json`);

		file[file.findIndex(t => t.name === ctx.user.data)] = tag;
		writeFileSync(filePath, JSON.stringify(file, null, 2));

		return ctx.reply({
			content: `Tag __${tagName}__ edited!`,
			ephemeral: false
		});
	},
})