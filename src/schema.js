import co from 'co';
import Path from './path';
import SchemaData from './schema-data';
import { SimpleOdmError } from './errors';

/**
 * @param data {SchemaData}
 * @returns {Promise.<SchemaData>}
 */
const defaultOnCreate = data => co(function* ()
{
    return data;
});

/**
 * @param data {SchemaData}
 * @returns {Promise.<SchemaData>}
 */
const defaultOnUpdate = data => co(function* ()
{
    return data;
});

export default class Schema {

    /**
     * @param name {string}
     * @param paths {object}
     * @param onCreate {function}
     * @param onUpdate {function}
     */
    constructor(
        {
            name,
            paths = {},
            onCreate,
            onUpdate}
    )
    {

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

        const emptySchemaData = new SchemaData({
            values: {},
            errorMessages: {}
        });

        onCreate = onCreate || defaultOnCreate;

        {
            const promise = onCreate(emptySchemaData);

            if (!(promise instanceof Promise)) {
                throw new SimpleOdmError("The return value of onCreate has to be a Promise object.");
            }
        }

        onUpdate = onUpdate || defaultOnUpdate;

        {
            const promise = onUpdate(emptySchemaData);

            if (!(promise instanceof Promise)) {
                throw new SimpleOdmError("The return value of onUpdate has to be a Promise object.");
            }
        }

        this._name = name;

        this._paths = {};
        for (let pathName of Object.keys(paths)) {
            this._paths[pathName] = new Path(pathName, paths[pathName]);
        }

        this._onCreate = onCreate;

        this._onUpdate = onUpdate;

        Object.freeze(this._paths);
        Object.freeze(this);
    }

    *[Symbol.iterator] ()
    {
        for (let pathName of Object.keys(this._paths)) {
            yield this._paths[pathName];
        }
    }

    /**
     * @returns {string}
     */
    get name()
    {
        return this._name;
    }

    /**
     * @returns {Object.<Path>}
     */
    get paths()
    {
        return this._paths;
    }

    /**
     * @param data {SchemaData}
     * @returns {Promise.<SchemaData>}
     */
    onCreate(data)
    {
        return this._onCreate(data).then(value =>
        {
            if (!(value instanceof SchemaData)) {
                throw new SimpleOdmError("The value of the resolved Promise object returned from onCreate has to be a SchemaData object.");
            }
            return value;
        });
    }

    /**
     * @param data {SchemaData}
     * @returns {Promise.<SchemaData>}
     */
    onUpdate(data)
    {
        return this._onUpdate(data).then(value =>
        {
            if (!(value instanceof SchemaData)) {
                throw new SimpleOdmError("The value of the resolved Promise object returned from onUpdate has to be a SchemaData object.");
            }
            return value;
        });
    }
}