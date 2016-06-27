import co from 'co';
import EventEmitter from 'events';
import deepcopy from 'deepcopy';
import { SimpleOdmError } from './errors';

const emitter = new EventEmitter();

class EventHub {

    static get on ()
    {
        return emitter.on.bind(emitter);
    }

    static emit (eventId, argObject)
    {
        const listeners = emitter.listeners(eventId);
        let result;
        let obj = deepcopy(argObject);

        return co(function* ()
        {
            for (const listener of listeners)
            {
                result = listener.call(null, obj);

                if (result instanceof Promise)
                {
                    result = yield result;
                }

                obj = Object.assign({}, obj, result);
            }

            return obj;
        });
    }
}

export default Object.freeze(EventHub);