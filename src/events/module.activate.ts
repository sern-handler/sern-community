import { eventModule, EventType, Payload, PayloadType, PluginType, SernEventPlugin } from "@sern/handler";
import { useContainer } from "../index.js";


export default eventModule( {
	name: 'module.activate',
	type: EventType.Sern,
	plugins: [filterFailedActivation()],
	execute(payload: Payload & { type : PayloadType.Failure }) {
		const [ logger ] = useContainer('@sern/logger')
		logger.warn({ message : `A module (${payload.module?.name} failed to execute: ${payload.reason}` })
	}
})

function filterFailedActivation() : SernEventPlugin {
	return {
		type: PluginType.Event,
		execute: ([payload], controller) => {
			if(payload.type == PayloadType.Failure) {
				return controller.next()
			} else {
			return controller.stop()
			}
		}
	}
}