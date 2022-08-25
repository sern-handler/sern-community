import { eventModule, EventType } from "@sern/handler";

export default eventModule({
	emitter: 'process',
	name: 'uncaughtException',
	type: EventType.External,
	execute(r) {
		console.log(r)
	},
})