import { readFile } from "fs/promises";
import TrieSearch from "trie-search";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const docs = require(`${process.cwd()}/docs.json`);
import type { DocsChild } from "../../typings/docs.js";


/**
 * Not bothering typing this json file
 */
export default class DocHandler {
	private __DocTrie!: TrieSearch<string, { name: string; node: DocsChild }>;
	private sectionTitleChildPairs: { name: string; node: DocsChild }[] = [];
	private sectionsOnly: string[] = [];
	get DocTrie() {
		return this.__DocTrie;
	}

	private transformSections() {
		docs.groups.pop()!; //Removes "Functions" from json
		for (const section of docs.groups) {
			if (section.title === "Namespaces") {
				const first = docs.children.shift()!;
				//assumed that first element is Sern namespace. This helps speed up processing nodes
				this.sectionTitleChildPairs.push({
					name: "Namespaces",
					node: first as DocsChild,
				});
				while (first?.children?.length ?? 0 !== 0) {
					const cur = first.children?.pop()!;
					this.sectionTitleChildPairs.push({
						name: `Sern.${cur.name}`,
						node: cur as DocsChild,
					});
				}
			} else {
				const sectionChildNodes = section.children.map((id: string) => {
					const node = docs.children.find(
						(c: { id: string }) => c.id === id
					)! as DocsChild;
					return {
						name: section.title,
						node,
					};
				});
				this.sectionsOnly.push(section.title);
				this.sectionTitleChildPairs.push(...sectionChildNodes);
			}
		}
	}

	setup() {
		this.transformSections();
		const trie = new TrieSearch<string, { name: string; node: DocsChild }>([
			"name",
			["node", "kindString"],
			["node", "id"],
			["node", "name"],
		]);
		trie.addAll(this.sectionTitleChildPairs);
		this.__DocTrie = trie;
	}
}
