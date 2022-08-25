import { eventModule, EventType } from "@sern/handler";

export default eventModule({
	emitter: "process",
	type: EventType.External,
	execute(r) {
		console.log(r);
	},
});
