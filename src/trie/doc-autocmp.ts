import TrieSearch from "trie-search";
import docs from '../../docs.json'


export default class DocHandler { 
    private __DocTrie : TrieSearch<unknown, unknown> | null = null;

    private get pairs() {
        const keys = Object.keys(docs);
        const output = [];
        while(keys.length !== 0) {
            const cur = keys.pop()!;
            const val = docs[cur as keyof typeof docs];
            output.push({ key : cur, value : val });
        }
        return output;
    }

    get DocTrie() {
        return this.__DocTrie; 
    }


    
    setup() {

        this.__DocTrie = new TrieSearch([
            'key'
        ]);
        this.__DocTrie.addAll(this.pairs);
        // console.log(this.pairs)
        console.log(this.__DocTrie.search('sources'))
    }
    
}