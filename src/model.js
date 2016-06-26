import co from 'co';
import { SimpleOdmError } from './errors';
import Schema from './schema';
import EventHub from './event-hub';
import Immutable from 'immutable';
import modelFunctions from './model-functions';

const initialValues = new WeakMap();

const overriddenValues = new WeakMap();

const inspectedErrors = new WeakMap();

const overriddenErrors = new WeakMap();

class Model {

    static get dbOperator ()
    {
        throw new SimpleOdmError("Implement dbOperator")
    }

    /**
     * @member {Schema}
     */
    static get schema ()
    {
        throw new SimpleOdmError("Implement schema")
    };

    /**
     * @param query {object}
     * @param sort {object}
     * @param limit {number}
     * @param skip {number}
     */
    static findMany ({query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        return co(function* ()
        {
            const docs = yield this.dbOperator.findMany({schema: this.schema, query, sort, limit, skip});
            return docs.map(doc => new this(doc));
        }.bind(this));
    }

    /**
     * @param query {object}
     */
    static findOne (query = {})
    {
        return co(function* ()
        {
            const doc = yield this.dbOperator.findOne({schema: this.schema, query});
            return doc ? new this(doc) : null;
        }.bind(this));
    }

    /**
     * @param values {object}
     */
    constructor (values = {})
    {
        if (!modelFunctions.isObject(values))
        {
            throw new SimpleOdmError("The values have to be an object");
        }

        this._schema = this.constructor.schema;
        this._dbOperator = this.constructor.dbOperator;

        initialValues.set(this, Immutable.fromJS(values));

        Object.freeze(this);
    }

    getValues ()
    {
        const _initialValues = initialValues.get(this) || Immutable.Map();
        const _overriddenValues = overriddenValues.get(this) || Immutable.Map();
        const filtered = _initialValues.merge(_overriddenValues).filter(v => v !== undefined);
        return filtered.toJS();
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
        const dbOperator = this._dbOperator;
        const schema = this._schema;
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
                info = yield dbOperator.getIndexInfo({schema});
            } catch (e)
            {}

            for (let path of schema)
            {
                if (!path.isUnique)
                {
                    continue;
                }

                const hasUniqueIndex = info === null
                    ? false
                    : info.filter(v => v.key[path.name] === 1 && v.unique === true).length > 0;

                if (!hasUniqueIndex)
                {
                    yield dbOperator.createUniqueIndex({schema, pathName: path.name});
                }
            }


            // Insert or update the model based on whether it has an ID.

            if (!id)
            {
                const ret = yield dbOperator.insertOne({
                    schema,
                    values: (yield this.getRefinedValues())
                });
                const newID = ret.insertedId;
                initialValues.get(this).set(schema.primaryPathName, newID);
            }
            else
            {
                yield dbOperator.updateOne({
                    schema,
                    query: modelFunctions.createIdQuery(schema.primaryPathName, id),
                    values: (yield this.getRefinedValues())
                });
            }

        }.bind(this));
    }

}

export default Object.freeze(Model);