import co from 'co';
import { SimpleOdmError } from './errors';
import Schema from './schema';
import pathFunctions from './path-functions';
import Store from './store';
import EventHub from './event-hub';
import pluralize from 'pluralize';

const inspectErrors = ({schema, updated, values}) => co(function* ()
{
    let errorMessages = {};

    for (let path of schema)
    {
        const value = values[path.name];
        errorMessages[path.name] = yield pathFunctions.inspectErrors({path, value, updated});
    }

    return errorMessages;
});

class Model {

    static findMany ({operator, driver, schema}, {query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        const ThisModel = this.bind(this, {operator, driver, schema});
        const collectionName = pluralize(schema.name);

        return co(function* ()
        {
            const docs = yield operator.findMany(driver, collectionName, query, sort, limit, skip);
            return docs.map(doc => new ThisModel(doc));
        });
    }

    static findOne ({operator, driver, schema}, query)
    {
        const ThisModel = this.bind(this, {operator, driver, schema});
        const collectionName = pluralize(schema.name);

        return co(function* ()
        {
            const doc = yield operator.findOne(driver, collectionName, query);
            return doc ? new ThisModel(doc) : null;
        });
    }

    /**
     * @param operator {CrudOperator}
     * @param driver {Driver}
     * @param schema {Schema}
     * @param values {object}
     */
    constructor ({operator, driver, schema}, values = {})
    {
        this._schema = schema;
        this._values = new Store(values);
        this._errors = new Store();
        this._driver = driver;
        this._operator = operator;
        this._collectionName = pluralize(schema.name);
        Object.freeze(this);
    }

    getRefinedValues ()
    {
        const schema = this._schema;
        const values = this.getValues();

        return co(function* ()
        {
            let obj = {};

            for (let path of schema)
            {
                const value = values[path.name];

                try
                {
                    obj[path.name] = yield pathFunctions.getRefinedValue({path, value});
                } catch (e)
                {}
            }

            return obj;
        })
    }

    getInitialValues ()
    {
        return this._values.getInitialData();
    }

    getValues ()
    {
        return this._values.get();
    }

    setValues (values)
    {
        this._values.set(values);
    }

    addValues (values)
    {
        this._values.add(values);
    }

    getErrors ()
    {
        return this._errors.get();
    }

    setErrors (errors)
    {
        if (!this._errors.isUpdated)
        {
            throw new SimpleOdmError("Errors of a model can't be modified manually before inspected.");
        }

        return this._errors.set(errors);
    }

    addErrors (errors)
    {
        if (!this._errors.isUpdated)
        {
            throw new SimpleOdmError("Errors of a model can't be modified manually before inspected.");
        }

        this._errors.add(errors);
    }

    get isUpdated ()
    {
        return this._values.isUpdated;
    }

    get hasErrors ()
    {
        return !this._errors.isEmpty;
    }

    save ()
    {
        return co(function* ()
        {
            this._errors.set(yield inspectErrors({
                schema: this._schema,
                updated: this.isUpdated,
                values: this.getValues()
            }));

            yield EventHub.emit(this._schema.BEFORE_SAVED, this);

            if (this.hasErrors)
            {
                throw this.getErrors();
            }

            if (!this.isUpdated)
            {
                const values = this.getValues();
                const primaryKey = this._schema.primaryPathName;
                const query = {[primaryKey]: values[primaryKey]};
                return yield this._operator.updateOne(this._driver, this._collectionName, query, this.getRefinedValues());
            } else
            {
                return yield this._operator.insertOne(this._driver, this._collectionName, this.getRefinedValues());
            }

        }.bind(this));
    }

}

export default Object.freeze(Model);