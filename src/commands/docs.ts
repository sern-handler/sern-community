
import { commandModule, CommandType } from '@sern/handler';
import { ApplicationCommandOptionType } from 'discord.js';
import { publish } from '../plugins/publish';
import DocHandler from '../trie/doc-autocmp';



new DocHandler().setup()
export default commandModule({
	type: CommandType.Slash,
	description : 'Query documentation',
	plugins: [
		publish(['941002690211766332'])
	],
	options: [
		{
			autocomplete: true,
			name: 'search',
			required : true,
			description: 'Search for the sern hander documentation',
			type: ApplicationCommandOptionType.String,
			command: {
				onEvent: [],
				execute(autocomplete) {
					// this is where autocomplete will be
				}
			}
		}
	],
	execute: async (context, options) => {
		const option = options[1].getString('search', true);   
    	
    	await context.reply(option) 
	}, 
});
