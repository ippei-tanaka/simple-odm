import co from 'co';
import { SimpleOdmError } from './errors';
import Schema from './schema';
import pathFunctions from './path-functions';
import Store from './store';
import EventHub from './event-hub';

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

    /**
     * @param schema {Schema}
     * @param values {object}
     */
    constructor (schema, values = {})
    {
        this._schema = schema;
        this._values = new Store(values);
        this._errors = new Store();
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
        return this._values.getFirst();
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
        return this._errors.set(errors);
    }

    addErrors (errors)
    {
        this._errors.add(errors);
    }

    get isUpdated ()
    {
        return this._values.isUpdated;
    }

    get hasErrors () {
        return !this._errors.isEmpty;
    }

    inspect ()
    {
        return co(function* ()
        {
            this.setErrors(yield inspectErrors({
                schema: this._schema,
                updated: this.isUpdated,
                values: this.getValues()
            }));

            yield EventHub.emit(this._schema.INSPECTED, this);

            if (this.hasErrors)
            {
                return this.getErrors();
            }

        }.bind(this));
    }

}

export default Object.freeze(Model);