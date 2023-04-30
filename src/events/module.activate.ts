import {
	controller,
	EventControlPlugin,
	eventModule,
	EventType,
	Payload,
	PayloadType,
} from "@sern/handler";
import { useContainer } from "../index.js";

export default eventModule({
	name: "module.activate",
	type: EventType.Sern,
	plugins: [filterFailedActivation()],
	execute(payload: Payload & { type: PayloadType.Failure }) {
		const [logger] = useContainer("@sern/logger");
		logger.warning({
			message: `A module (${payload.module?.name} failed to execute: ${payload.reason}`,
		});
	},
});

function filterFailedActivation() {
	return EventControlPlugin<EventType.Sern>((payload) => {
		if (payload.type == PayloadType.Failure) {
			return controller.next();
		} else {
			return controller.stop();
		}
	});
}
