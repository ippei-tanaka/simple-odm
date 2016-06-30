import co from 'co';
import { SimpleOdmError } from './errors';
import EventHub from './event-hub';
import modelFunctions from './model-functions';

const initialValuesMap = new WeakMap();

class Model {

    /**
     * @member {Schema}
     */
    static get schema ()
    {
        throw new SimpleOdmError("Implement schema")
    };

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

        initialValuesMap.set(this, Object.assign({}, values));

        this._state = {
            values: modelFunctions.createValueObjectWithId({
                values,
                idPathName: this._schema.primaryPathName,
                idGetter: function () { return this.id }.bind(this)
            })
        };
    }

    get values ()
    {
        return this._state.values;
    }

    get id ()
    {
        return initialValuesMap.get(this)[this._schema.primaryPathName];
    }

    toJSON ()
    {
        return JSON.parse(JSON.stringify(this._state.values));
    }

    save ()
    {
        const schema = this._schema;
        const id = this.id;
        const initialValues = initialValuesMap.get(this);
        const rawValues = this.values;

        return co(function* ()
        {

            // Inspect errors based on the model's value,
            // the model's schema, and whether the model has an ID.

            const inspectedErrors = yield modelFunctions.inspectErrors({
                schema,
                updated: !!id,
                values: rawValues
            });


            // Generate values formatted based on the schema

            const formattedValues = yield modelFunctions.generateFormattedValues({
                schema,
                values: rawValues
            });


            // Invoke the before save event.
            // Listeners of this event are given the model.
            // They may modify given errors or values and return them.

            const resultOfHooks = yield EventHub.emit(schema.BEFORE_SAVED, {
                errors: Object.freeze(Object.assign({}, inspectedErrors)),
                values: Object.freeze(Object.assign({}, formattedValues)),
                initialValues: Object.freeze(Object.assign({}, initialValues))
            });

            // Check returned values

            if (typeof resultOfHooks !== 'object' || resultOfHooks === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hook returns a non-object or null.");
            }

            if (typeof resultOfHooks.errors !== 'object' || resultOfHooks.errors === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hooks returns an object with the invalid errors property.");
            }

            if (typeof resultOfHooks.values !== 'object' || resultOfHooks.values === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hooks returns an object with the invalid values property.");
            }

            // Throw errors if they exist.

            if (Object.keys(resultOfHooks.errors).filter(key => resultOfHooks.errors[key].length > 0).length > 0)
            {
                throw resultOfHooks.errors;
            }

            const resultOfSave = yield this._save({
                errors: resultOfHooks.errors,
                values: resultOfHooks.values
            });

            initialValuesMap.set(this, Object.assign({}, resultOfSave.values));

            this._state.values = modelFunctions.createValueObjectWithId({
                values: Object.assign({}, resultOfSave.values),
                idPathName: schema.primaryPathName,
                idGetter: function () { return this.id }.bind(this)
            });

        }.bind(this));
    }

    _save ({errors, values})
    {
        return Promise.resolve({errors, values});
    }

}

export default Object.freeze(Model);