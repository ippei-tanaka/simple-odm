import Path from './path';
import { SimpleOdmError } from './errors';

const defaultOnCreate = () => {};

const defaultOnUpdate = () => {};

export default class Schema {

    /**
     * @param name {string}
     * @param paths {object}
     * @param onCreate {function}
     * @param onUpdate {function}
     */
    constructor({
        name,
        paths = {},
        onCreate,
        onUpdate}
    ) {

        if (typeof name !== "string") {
            throw new SimpleOdmError('A schema name has to be string.');
        }

        if (typeof paths !== "object"
            || paths === null
            || Array.isArray(paths)) {
            throw new SimpleOdmError('A paths argument has to be an object.');
        }

        if (onCreate && typeof onCreate !== 'function') {
            throw new SimpleOdmError('onCreate has to be a function.');
        }

        if (onUpdate && typeof onUpdate !== 'function') {
            throw new SimpleOdmError('onUpdate has to be a function.');
        }

        this._name = name;

        this._paths = {};
        for (let pathName of Object.keys(paths)) {
            this._paths[pathName] = new Path(pathName, paths[pathName]);
        }

        this._onCreate = onCreate || defaultOnCreate;

        this._onUpdate = onUpdate || defaultOnUpdate;

        Object.freeze(this._paths);
        Object.freeze(this);
    }

    *[Symbol.iterator] () {
        for (let pathName of Object.keys(this._paths)) {
            yield this._paths[pathName];
        }
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {Object.<Path>}
     */
    get paths() {
        return this._paths;
    }

    get onCreate () {
        return this._onCreate;
    }

    get onUpdate () {
        return this._onUpdate;
    }
}