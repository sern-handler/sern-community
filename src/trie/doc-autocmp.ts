import TrieSearch from "trie-search";
import docs from '../../docs.json'


export default class DocHandler { 
    private __DocTrie : TrieSearch<unknown, unknown> | null = null;
    private mockDoc: Record<string, Record<string,string> | string> =  {
        node: 'gondo',
        gargantuan : {
            serendipity : 'discord',
            shalnark : 'hxh',
            machi : 'hxh',
            lucifer: 'devil dude',
        },
        experimental : 'goongaginga'
    };
    private get pairs() {
        const keys = Object.keys(this.mockDoc);
        const output = [] as { key : string, value : string | Record<string,string> }[];
        while(keys.length !== 0) {
            const cur = keys.pop()!;
            const val = this.mockDoc[cur];
            output.push({ key : cur, value : val });
        }
        return output;
    }

    get DocTrie() {
        return this.__DocTrie; 
    }


    
    setup() {

        this.__DocTrie = new TrieSearch([
            'value'
        ]);
        this.__DocTrie.addAll(this.pairs);
        console.log(this.__DocTrie.search('g'))
    }
    
}