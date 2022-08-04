import { commandModule, CommandType } from '@sern/handler';
import { publish } from '../plugins/publish';
export default commandModule({
	type: CommandType.Slash,
	plugins: [ publish() ],
	description: 'Pong!',
	execute: async (context) => {
		await context.reply('Pong 🏓');
	},
});
