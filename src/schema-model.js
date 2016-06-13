import co from 'co';
import PathModel from './path-model';
import { SimpleOdmError } from './errors';
import Schema from './schema';

export default class SchemaModel {

    /**
     * @param schema {Schema}
     * @param onCreate {function}
     * @param onUpdate {function}
     * @return
     */
    static createModel({schema, onCreate, onUpdate}) {
        return this.bind(null, schema, onCreate, onUpdate);
    }

    /**
     * @param schema {Schema}
     * @param onCreate {function}
     * @param onUpdate {function}
     * @param values {object}
     */
    constructor(schema,
                onCreate = () => {},
                onUpdate = () => {},
                values = {}) {

        if (!(schema instanceof Schema)) {
            throw new SimpleOdmError('A schema argument has to be a Schema object.');
        }

        if (typeof values !== "object"
            || values === null
            || Array.isArray(values)) {
            throw new SimpleOdmError('A values argument has to be an object.');
        }

        this._schema = schema;

        this._pathDataMap = {};
        for (let path of schema) {
            this._pathDataMap[path.name] = new PathModel(path, values[path.name]);
        }

        this._onCreate = onCreate;

        this._onUpdate = onUpdate;

        Object.freeze(this._pathDataMap);
        Object.freeze(this);
    }

    *[Symbol.iterator] () {
        for (let pathName of Object.keys(this._pathDataMap)) {
            yield this._pathDataMap[pathName];
        }
    }

    /**
     * @returns {Schema}
     */
    get schema() {
        return this._schema;
    }

    get projectedValues() {
        const _values = {};

        for (let pathData of this) {
            const value = pathData.projectedValue;

            if (value) {
                _values[pathData.name] = value;
            }
        }

        return _values;
    }

    get onCreate () {
        return this._onCreate;
    }

    get onUpdate () {
        return this._onUpdate;
    }

    examine() {
        const messageMap = {};

        for (let pathData of this) {
            const iterator = pathData.examine();
            const messages = [];

            for (let message of iterator) {
                messages.push(message);
            }

            if (messages.length > 0) {
                messageMap[pathData.path.name] = messages;
            }
        }

        return messageMap;
    }

    toJSON() {
        return this.projectedValues;
    }
}