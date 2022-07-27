
import { commandModule, CommandType } from '@sern/handler';
import { ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, ComponentType, EmbedBuilder } from 'discord.js';
import { Paginate } from '../pagination';
import { publish } from '../plugins/publish';
import DocHandler from '../trie/doc-autocmp';

const docHandler = new DocHandler();
docHandler.setup();
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
				async execute(autocomplete) {
					const choices = docHandler.DocTrie.search(autocomplete.options.getFocused())
					await autocomplete.respond(choices.map((res => ({ name : res.node.name, value: res.node.name }))).slice(0,25));
				}
			}
		}
	],
	execute: async (context, options) => {
		const option = options[1].getString('search', true);   
    	const result = docHandler.DocTrie.search(option)
		const embeds = result.map(res => {
			return new EmbedBuilder()
				.addFields(
					{ name : 'Category', value : res.name },
					{ name : 'Description', value: 'No description' }
				)
				.setTitle(res.node.name)
				.setColor(Colors.DarkVividPink)
				.setAuthor({ name: 'Source', url: `${res.node.sources[0].url ?? 'External implementation'}` })
		});
		const paginator = Paginate();
		paginator.add(...embeds);
		const ids = [`${Date.now()}__left`, `${Date.now()}__right`]
		paginator.setTraverser([ 
			new ButtonBuilder({ label : '<', custom_id : ids[0], style: ButtonStyle.Secondary}),
			new ButtonBuilder({ label : '>', custom_id : ids[1], style: ButtonStyle.Secondary}) 
		]);
		await context.interaction.deferReply();
		const message = await context.interaction.editReply(paginator.components())
		paginator.setMessage(message)
		message.channel.createMessageComponentCollector({
			componentType: ComponentType.Button
		}).on('collect',async i => {
			if(i.customId === ids[0]) {
				await i.deferUpdate();
				await paginator.back();
			} else if(i.customId === ids[1]) {
				await i.deferUpdate();
				await paginator.next();
			}
		}) 
	}, 
});
