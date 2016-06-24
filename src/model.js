import co from 'co';
import { SimpleOdmError } from './errors';
import Schema from './schema';
import EventHub from './event-hub';
import pluralize from 'pluralize';
import Immutable from 'immutable';
import modelFunctions from './model-functions';

const initialValues = new WeakMap();

const overriddenValues = new WeakMap();

const inspectedErrors = new WeakMap();

const overriddenErrors = new WeakMap();

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
     * @param utils {DbUtils}
     * @param values {object}
     */
    constructor ({operator, driver, schema, utils}, values = {})
    {
        if (!modelFunctions.isObject(values))
        {
            throw new SimpleOdmError("The values have to be an object");
        }

        this._schema = schema;
        this._driver = driver;
        this._operator = operator;
        this._utils = utils;
        this._collectionName = pluralize(schema.name);

        initialValues.set(this, Immutable.fromJS(values));

        Object.freeze(this);
    }

    getValues ()
    {
        const initialValues = this.getInitialValues();
        const overriddenValues = this.getOverriddenValues();
        return Object.assign({}, initialValues, overriddenValues);
    }

    getInitialValues ()
    {
        const obj = initialValues.get(this);
        return obj !== undefined ? obj.toJS() : null;
    }

    getOverriddenValues ()
    {
        const obj = overriddenValues.get(this);
        return obj !== undefined ? obj.toJS() : null;
    }

    setOverriddenValues (values)
    {
        if (!modelFunctions.isObject(values))
        {
            throw new SimpleOdmError("The values have to be an object");
        }

        overriddenValues.set(this, Immutable.fromJS(values));
    }

    addOverriddenValues (values)
    {
        if (!modelFunctions.isObject(values))
        {
            throw new SimpleOdmError("The values have to be an object");
        }

        let obj = overriddenValues.get(this);

        obj = obj !== undefined ? obj : Immutable.Map();

        overriddenValues.set(this, obj.merge(Immutable.fromJS(values)));
    }

    getRefinedValues ()
    {
        const schema = this._schema;
        const values = this.getValues();
        return modelFunctions.generateRefinedValues({schema, values});
    }

    getErrors ()
    {
        const _inspectedErrors = inspectedErrors.get(this) || Immutable.Map();
        const _overriddenErrors = overriddenErrors.get(this) || Immutable.Map();
        const filtered = _inspectedErrors.merge(_overriddenErrors).filter(v => v.size > 0);
        return filtered.size > 0 ? filtered.toJS() : null;
    }

    getInspectedErrors ()
    {
        const obj = inspectedErrors.get(this);
        return obj !== undefined ? obj.toJS() : null;
    }

    getOverriddenErrors ()
    {
        const obj = overriddenErrors.get(this);
        return obj !== undefined ? obj.toJS() : null;
    }

    setOverriddenErrors (errors)
    {
        if (!modelFunctions.isObject(errors))
        {
            throw new SimpleOdmError("The errors have to be an object");
        }

        overriddenErrors.set(this, Immutable.fromJS(errors));
    }

    addOverriddenErrors (errors)
    {
        if (!modelFunctions.isObject(errors))
        {
            throw new SimpleOdmError("The errors have to be an object");
        }

        let obj = overriddenErrors.get(this);

        obj = obj !== undefined ? obj : Immutable.Map();

        overriddenErrors.set(this, obj.merge(Immutable.fromJS(errors)));
    }

    get id ()
    {
        return this.getInitialValues()[this._schema.primaryPathName] || null;
    }

    save ()
    {
        const driver = this._driver;
        const collectionName = this._collectionName;
        const operator = this._operator;
        const schema = this._schema;
        const utils = this._utils;
        const id = this.id;

        return co(function* ()
        {

            // Inspect errors based on the model's value,
            // the model's schema, and whether the model has an ID.

            const _inspectedErrors = yield modelFunctions.inspectErrors({
                schema,
                updated: !!id,
                values: this.getValues()
            });

            inspectedErrors.set(this, Immutable.fromJS(_inspectedErrors));


            // Invoke the before save event.
            // Listeners of this event are given the model.
            // They may modify its overridden errors or values.

            yield EventHub.emit(schema.BEFORE_SAVED, this);


            // Throw errors if they exist.

            const errors = this.getErrors();

            if (errors)
            {
                throw errors;
            }


            // Create unique indexes if they don't exist.

            let info = null;

            try
            {
                info = yield utils.getIndexInfo(driver, collectionName);
            } catch (e)
            {}

            for (let path of schema)
            {
                if (!path.isUnique)
                {
                    continue;
                }

                const hasUniqueIndex = info === null ? false : info.filter(v => v.key[path.name] === 1 && v.unique === true).length > 0;

                if (!hasUniqueIndex)
                {
                    yield utils.createUniqueIndex(driver, collectionName, path.name);
                }
            }


            // Insert or update the model based on whether it has an ID.

            if (!id)
            {
                const ret = yield operator.insertOne(driver, collectionName, (yield this.getRefinedValues()));
                const newID = ret.insertedId;
                initialValues.get(this).set(schema.primaryPathName, newID);
            }
            else
            {
                yield operator.updateOne(driver, collectionName, modelFunctions.createIdQuery(schema.primaryPathName, id), (yield this.getRefinedValues()));
            }

        }.bind(this));
    }

}

export default Object.freeze(Model);