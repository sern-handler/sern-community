import type TrieSearch from "trie-search";
import docs from '../../docs.json'
import type { DocsChild, TentacledKindString } from "../../typings/docs";

/**
 * Not bothering typing this json file
 */
export default class DocHandler { 
    private __DocTries : TrieSearch<unknown, unknown>[] = [];
    private sectionTitleChildPairs : { name : string, node : DocsChild }[] = []
    private sectionsOnly : string[] = []
    get DocTries() {
        return this.__DocTries; 
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
        console.log(this.sectionTitleChildPairs)
    }
    
}