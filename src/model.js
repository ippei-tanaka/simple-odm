import co from 'co';
import schemaFunctions from './schema-functions';
import SchemaData from './schema-data';
import { SimpleOdmError } from './errors';

export default class Model {

    static bindDependencies ({operator, schema})
    {
        return this.bind(null, operator, schema);
    }

    /**
     * @param operator {CrudOperator}
     * @param schema {Schema}
     * @param values {object}
     */
    constructor (operator, schema, values)
    {
        this._schema = schema;
        this._operator = operator;
        this._values = values;
        Object.freeze(this);
    }

    findMany ({query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        const Model = this;
        const operator = this._operator;

        return co(function* ()
        {
            const docs = yield operator.findMany(query, sort, limit, skip);
            return docs.map(doc => new Model(doc));
        });
    }

    findOne (query)
    {
        const Model = this;
        const operator = this._operator;

        return co(function* ()
        {
            const doc = yield operator.findOne(query);
            return doc ? new Model(doc) : null;
        });
    }

    aggregate (query)
    {
        const operator = this._operator;

        return co(function* ()
        {
            return yield operator.aggregate(query);
        });
    }

    save ()
    {
        const schema = this._schema;
        const values = this._values;
        const operator = this._operator;

        return co(function* ()
        {
            const errorMessages = yield schemaFunctions.inspectErrorsOnCreate({schema, values});

            let data = new SchemaData({values, errorMessages});

            data = yield schemaFunctions.executeOnCreateHook({schema, data});

            if (data.hasErrors)
            {
                throw data.errorMessages;
            }

            return yield operator.insertOne(data.values);
        });
    }

}