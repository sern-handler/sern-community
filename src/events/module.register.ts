import { eventModule, EventType, Payload, PayloadType } from "@sern/handler";

export default eventModule({
	type: EventType.Sern,
	name: "module.register",
	execute(args: Payload) {
		if (args.type === PayloadType.Success) {
			console.log(`[✅]: ${args.module.name} sucessfully registered`);
		}
	},
});
