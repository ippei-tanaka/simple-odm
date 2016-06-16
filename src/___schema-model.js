import co from 'co';
import PathModel from './path-model';
import { SimpleOdmError } from './errors';
import Schema from './schema';

export class SchemaModel {

    /**
     * @param schema {Schema}
     * @return
     */
    static createModel({schema}) {
        return this.bind(null, schema);
    }

    /**
     * @param schema {Schema}
     * @param values {object}
     */
    constructor(
        schema,
        values = {}
    ) {

        if (!(schema instanceof Schema)) {
            throw new SimpleOdmError('A schema argument has to be a Schema object.');
        }

        if (typeof values !== "object"
            || values === null
            || Array.isArray(values)) {
            throw new SimpleOdmError('A values argument has to be an object.');
        }

        this._schema = schema;


        this._pathModelMap = {};
        for (let path of schema) {
            this._pathModelMap[path.name] = new PathModel(path, values[path.name]);
        }

        this._errorMessageMap = {};

        Object.freeze(this._pathModelMap);
        Object.freeze(this);
    }

    *[Symbol.iterator] () {
        for (let pathName of Object.keys(this._pathModelMap)) {
            yield this._pathModelMap[pathName];
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
            _values[pathData.name] = pathData.projectedValue;
        }

        return _values;
    }

    get rawValues() {
        const _values = {};

        for (let pathData of this) {
            _values[pathData.name] = pathData.rawValue;
        }

        return _values;
    }

    get errorMessages () {
        return this._errorMessageMap;
    }

    toJSON() {
        return this.projectedValues;
    }
}

const inspectErrors = (schemaModel, updated) => {

    const messageMap = {};

    for (let pathData of schemaModel) {
        const iterator = pathData.inspectErrors({updated});
        const messages = [];

        for (let message of iterator) {
            messages.push(message);
        }

        if (messages.length > 0) {
            messageMap[pathData.path.name] = messages;
        }
    }

    return messageMap;

};

export class InspectedCreatedSchemaModel extends SchemaModel {

    constructor (...args) {
        super(...args);

        const errorMap = inspectErrors(this, false);

        for (let key of Object.keys(errorMap))
        {
            this._errorMessageMap[key] = errorMap[key];
        }

        Object.freeze(this._errorMessageMap);
    }

}

export class InspectedUpdatedSchemaModel extends SchemaModel {

    constructor(...args) {
        super(...args);

        const errorMap = inspectErrors(this, true);

        for (let key of Object.keys(errorMap)) {
            this._errorMessageMap[key] = errorMap[key];
        }

        Object.freeze(this._errorMessageMap);
    }
}