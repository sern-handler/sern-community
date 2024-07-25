import {
    controller,
    eventModule,
    EventType,
    Payload,
    PayloadType,
    Service,
} from "@sern/handler";

export default eventModule({
    name: "module.activate",
    type: EventType.Sern,
    execute(payload: Payload & { type: 'failure' }) {
        const logger = Service("@sern/logger");
        logger.warning({
            message: `A module (${payload.module?.name} failed to execute: ${payload.reason}`,
        });
    },
});

