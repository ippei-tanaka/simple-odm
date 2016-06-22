import co from 'co';
import EventEmitter from 'events';

const emitter = new EventEmitter();

class EventHub {

    static get on ()
    {
        return emitter.on.bind(emitter);
    }

    static emit (eventId, ...args)
    {
        const listeners = emitter.listeners(eventId);
        let ret;

        return co(function* ()
        {
            for (const listener of listeners)
            {
                ret = listener.call(null, ...args);

                if (ret instanceof Promise)
                {
                    yield ret;
                }
            }
        });
    }
}

export default Object.freeze(EventHub);