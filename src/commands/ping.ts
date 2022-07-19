import { commandModule, CommandType } from '@sern/handler';
import { publish } from '../plugins/publish';
export default commandModule({
	type: CommandType.Slash,
	plugins: [ publish(['941002690211766332']) ],
	execute: async (context) => {
		await context.reply('Pong 🏓');
	},
});
