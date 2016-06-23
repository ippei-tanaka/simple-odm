import Path from './path';
import { SimpleOdmError } from './errors';

class Schema {

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

        this._BEFORE_SAVED = Symbol();

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

    get primaryPath ()
    {
        return this._paths[this.primaryPathName];
    }

    get primaryPathName ()
    {
        return null;
    }

    get BEFORE_SAVED ()
    {
        return this._BEFORE_SAVED;
    }
}

export default Object.freeze(Schema);