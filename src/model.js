import co from 'co';
import { SimpleOdmError } from './errors';
import EventHub from './event-hub';
import modelFunctions from './model-functions';

const initialValuesMap = new WeakMap();

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
        this._state = {
            values: Object.assign({}, values)
        };

        initialValuesMap.set(this, Object.assign({}, values));

        Object.freeze(this);
    }

    get values ()
    {
        return this._state.values;
    }

    set values (v)
    {
        this._state.values = v;
    }

    get id ()
    {
        return initialValuesMap.get(this)[this._schema.primaryPathName];
    }

    save ()
    {
        const dbOperator = this._dbOperator;
        const schema = this._schema;
        const id = this.id;
        const initialValues = initialValuesMap.get(this);
        const rawValues = this.values;
        //const updatedValues = modelFunctions.findDifference(initialValues, rawValues);

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

            const result = yield EventHub.emit(schema.BEFORE_SAVED, {
                errors: inspectedErrors,
                values: formattedValues,
                initialValues
            });

            // Check returned values

            if (typeof result !== 'object' || result === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hook returns a non-object or null.");
            }

            if (typeof result.errors !== 'object' || result.errors === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hooks returns an object with the invalid errors property.");
            }

            if (typeof result.values !== 'object' || result.values === null)
            {
                throw new SimpleOdmError("A BEFORE_SAVE hooks returns an object with the invalid values property.");
            }

            // Throw errors if they exist.

            if (Object.keys(result.errors).filter(key => result.errors[key].length > 0).length > 0)
            {
                throw result.errors;
            }

            // Assign final values

            const finalValues = result.values;

            // Create unique indexes if they don't exist.

            {
                let info = null;

                try
                {
                    info = yield dbOperator.getIndexInfo({schema});
                }
                catch (e)
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
            }


            // Insert or update the model based on whether it has an ID.

            if (!id)
            {
                const { insertedId } = yield dbOperator.insertOne({
                    schema,
                    values: finalValues
                });

                initialValuesMap.get(this)[schema.primaryPathName] = insertedId;

                this.values = finalValues;
            }
            else
            {
                yield dbOperator.updateOne({
                    schema,
                    query: modelFunctions.createIdQuery(schema.primaryPathName, id),
                    values: finalValues
                });

                this.values = finalValues;
            }

        }.bind(this));
    }

}

export default Object.freeze(Model);