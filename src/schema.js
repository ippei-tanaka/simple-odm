import Path from './path';
import { SimpleOdmError } from './errors';

export default class Schema {

    constructor({name, paths = {}, onCreate, onUpdate}) {

        if (typeof name !== "string") {
            throw new SimpleOdmError('A schema name has to be string.');
        }

        if (typeof paths !== "object") {
            throw new SimpleOdmError('A paths argument has to be an object.');
        }

        if (typeof onCreate !== "function") {
            throw new SimpleOdmError('An onCreate callback has to be a function.');
        }

        if (typeof onUpdate !== "function") {
            throw new SimpleOdmError('An onUpdate callback has to be a function.');
        }

        this._name = name;

        this._paths = {};
        for (let pathName of Object.keys(paths)) {
            this._paths[pathName] = new Path(pathName, paths[pathName]);
        }

        this._projection = {};
        for (let path of this) {
            this._projection[path.name] = path.isProjected;
        }

        this._onCreate = onCreate;

        this._onUpdate = onUpdate;

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
     * @returns {{}}
     */
    get projection() {
        return this._projection;
    }

    /**
     * @returns {function}
     */
    get onCreate() {
        return this._onCreate;
    }

    /**
     * @returns {function}
     */
    get onUpdate() {
        return this._onUpdate;
    }

    /**
     * @param pathName {string}
     * @returns {Path}
     */
    getPath(pathName) {
        return this._paths[pathName];
    }
}