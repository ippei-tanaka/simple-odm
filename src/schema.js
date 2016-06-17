import co from 'co';
import EventEmitter from 'events';
import Path from './path';
import { SimpleOdmError } from './errors';

const ON_SAVE_EVENT = Symbol();

/**
 * @param data {object}
 * @returns {Promise.<object>}
 */
const defaultOnCreate = data => co(function* ()
{
    return data;
});

/**
 * @param data {object}
 * @returns {Promise.<object>}
 */
const defaultOnUpdate = data => co(function* ()
{
    return data;
});

export default class Schema {

    /**
     * @param name {string}
     * @param paths {object}
     */
    constructor ({name, paths = {}})
    {

        if (typeof name !== "string")
        {
            throw new SimpleOdmError('A schema name has to be string.');
        }

        if (typeof paths !== "object"
            || paths === null
            || Array.isArray(paths))
        {
            throw new SimpleOdmError('A paths argument has to be an object.');
        }

        this._name = name;

        this._paths = {};
        for (let pathName of Object.keys(paths))
        {
            this._paths[pathName] = new Path(pathName, paths[pathName]);
        }

        this._emitter = new EventEmitter();

        Object.freeze(this._paths);
        Object.freeze(this);
    }

    *[Symbol.iterator] ()
    {
        for (let pathName of Object.keys(this._paths))
        {
            yield this._paths[pathName];
        }
    }

    /**
     * @returns {string}
     */
    get name ()
    {
        return this._name;
    }

    /**
     * @returns {Object.<Path>}
     */
    get paths ()
    {
        return this._paths;
    }

    static get ON_SAVE ()
    {
        return ON_SAVE_EVENT;
    }

    get on ()
    {
        return this._emitter.on.bind(this._emitter);
    }

    get emit ()
    {
        return this._emitter.emit.bind(this._emitter);
    }

}