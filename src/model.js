import co from 'co';
import schemaFunctions from './schema-functions';
import SchemaData from './schema-data';
import { SimpleOdmError } from './errors';

class Model {

    /**
     * @param operator {CrudOperator}
     * @param schema {Schema}
     * @param values {object}
     */
    constructor ({operator, schema}, values)
    {
        this._schema = schema;
        this._operator = operator;
        this._values = values;
        Object.freeze(this);
    }

    static findMany ({operator, schema}, {query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        const ThisModel = this;

        return co(function* ()
        {
            const docs = yield operator.findMany(query, sort, limit, skip);
            return docs.map(doc => new ThisModel(doc));
        });
    }

    static findOne ({operator, schema}, query)
    {
        const ThisModel = this;

        return co(function* ()
        {
            const doc = yield operator.findOne(query);
            return doc ? new ThisModel(doc) : null;
        });
    }

    static aggregate ({operator, schema}, query)
    {
        return co(function* ()
        {
            return yield operator.aggregate(query);
        });
    }

    save ()
    {
        const operator = this._operator;
        const schema = this._schema;
        const values = this._values;

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

Object.freeze(Model);

export default Model;