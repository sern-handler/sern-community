import { eventModule, EventType } from '@sern/handler';

export default eventModule({
    type: EventType.Sern,
    name: 'module.register',
    execute(args) {
        console.log(args);
    }
})