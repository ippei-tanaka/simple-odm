import EventEmitter from 'events';

const emitter = new EventEmitter();

export default
{
    on: (event) => new Promise((resolve, reject) => {
        emitter.on(event, (...args) => {
            resolve.apply(null, args);
        });
    }),

    off: emitter.removeListener.bind(emitter),

    emit: emitter.emit.bind(emitter)
}

export const MONGO_CONNECT = 'MongoConnect';