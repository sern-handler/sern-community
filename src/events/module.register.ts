import { eventModule, EventType, Payload, PayloadType } from "@sern/handler";

export default eventModule({
	type: EventType.Sern,
	name: "module.register",
	execute(args: Payload) {
		if (args.type === PayloadType.Success) {
			process.stdout.write(`[✅]: ${args.module.name} sucessfully registered`);
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
		}
	},
});
