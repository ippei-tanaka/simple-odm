import co from 'co';
import EventEmitter from 'events';
import deepcopy from 'deepcopy';

const emitter = new EventEmitter();

class EventHub {

    static get on ()
    {
        return emitter.on.bind(emitter);
    }

    /**
     * @param {String|Symbol} eventId - the id of the event
     * @param {Object} [argObject=null] - arguments sent to event listeners
     * @return {Promise} the promise object that will be resolved when all the listeners of the event are notified
     */
    static emit (eventId, argObject = null)
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

Object.freeze(EventHub);

export default EventHub;