import { commandModule, CommandType } from '@sern/handler';
import { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder } from 'discord.js';
import { Paginate } from '../pagination';
import { publish } from '../plugins/publish';
import DocHandler from '../trie/doc-autocmp';
import { Kind, PurpleComment, PurpleSummary, TentacledKindString } from '../../typings/docs';
import { Paginator } from '../Paginator';

function handleComments(sum : PurpleSummary) {
	switch(sum.kind) {
		case Kind.Text : case Kind.Code : return { name : sum.kind, value: sum.text };
		case Kind.InlineTag : return { name : 'Reference', value: `[${docHandler.DocTrie.search(sum.target!.toString())}](${sum.text})`};
	}
}
const docHandler = new DocHandler();
docHandler.setup();
export default commandModule({
	type: CommandType.Slash,
	description: 'Query documentation',
	plugins: [publish()],
	options: [
		{
			autocomplete: true,
			name: 'search',
			required : true,
			description: 'Search for the sern handler documentation',
			type: ApplicationCommandOptionType.String,
			command: {
				onEvent: [],
				execute(autocomplete) {
					const choices = docHandler.DocTrie.search(autocomplete.options.getFocused())
					return autocomplete.respond(choices.map((res => ({ name : res.node.name, value: res.node.name }))).slice(0,25));
				}
			}
		}
	],
	execute: async (context, options) => {
		const option = options[1].getString('search', true);   
    	const result = docHandler.DocTrie.search(option);

		if (!result.length) {
			return context.reply('No results found');
		}

		const embeds = result.map(res => {
			const comments = 
			res.node.kindString === TentacledKindString.Function 
			? 
				res.node.signatures?.flatMap(dec => {
					const summary = dec.comment?.summary as PurpleSummary[] | undefined;
					return summary?.map(handleComments) ?? []
				})
			: res.node.comment?.summary?.map(handleComments);

			let blockTags = res.node.kindString === TentacledKindString.Function
			? 
				res.node.signatures?.flatMap(dec => {
					const summary = dec.comment as PurpleComment | undefined;
					return summary?.blockTags?.flatMap(btags => {
						return btags.content.map(c => ({ name : btags.tag, value: c.text}))
					}) ?? [];
				})
			:  res.node?.comment?.blockTags?.flatMap(btags => {
				return btags.content.map(c => ({ name : btags.tag, value: c.text}))
			});

			blockTags = blockTags?.map(tag => {
				return {
					name: tag.name,
					value: tag.value.replace(/ title=(?:.+)./gm, '')
				}
			})

			return new EmbedBuilder()
				.addFields(
					{ name : 'Category', value : res.name },
					...comments ?? [],
					...blockTags ?? []
				)
				.setTitle(`🔖 ${res.node.name}`)
				.setColor(Colors.DarkVividPink)
				.setAuthor({ name: 'sern', iconURL : context.client.user?.displayAvatarURL() })
				.setURL(res.node.sources[0].url ?? 'External implementation')
		});
		const paginator = new Paginator({ embeds })

		return paginator.run(context.interaction);
	}, 
});
