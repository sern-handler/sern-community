import TrieSearch from "trie-search";
import docs from '../../docs.json'
import type { DocsChild, TentacledKindString } from "../../typings/docs";

/**
 * Not bothering typing this json file
 */
export default class DocHandler { 
    private __DocTrie! : TrieSearch<string, {name : string, node: DocsChild}>;
    private sectionTitleChildPairs : { name : string, node : DocsChild }[] = []
    private sectionsOnly : string[] = []
    get DocTrie() {
        return this.__DocTrie; 
    }
    
    private transformSections() {
        for(const section of docs.groups) {
            if(section.title === 'Sern') {
                //assumed that first element is Sern namespace. This helps speed up processing nodes
                this.sectionTitleChildPairs.push({ name : "Sern", node : docs.children.shift() as DocsChild  });
            } else {
                const sectionChildNodes = section.children.map(id => {
                    const node = docs.children.find(c => c.id === id)! as DocsChild;
                    return ({
                        name : section.title,
                        node
                    })
                });
                this.sectionsOnly.push(section.title)
                this.sectionTitleChildPairs.push(...sectionChildNodes);
            }
        }
    }
    
    setup() {
        this.transformSections();
        const trie = new TrieSearch<string, { name : string; node : DocsChild}>(
            ['name',
             ['node', 'kindString'],
             ['node', 'id'],
             ['node', 'name']
            ])
        trie.addAll(this.sectionTitleChildPairs);
        this.__DocTrie = trie;
    }
    
}