import co from 'co';
import { SimpleOdmError } from './errors';
import Immutable from 'immutable';
import Schema from './schema';
import pathFunctions from './path-functions';
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
        if (typeof values !== 'object' || values === null)
        {
            throw new SimpleOdmError("The values argument has to be an object");
        }

        this._schema = schema;

        this._state = {
            dataList: Immutable.fromJS([values]),
            errorList: Immutable.List()
        };

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
        return this._state.dataList.first().toJS();
    }

    getValues ()
    {
        return this._state.dataList.last().toJS();
    }

    setValues (values)
    {
        this._state.dataList = this._state.dataList.push(Immutable.fromJS(values));
    }

    addValues (values)
    {
        const newValues = this._state.dataList.last().merge(Immutable.fromJS(values));
        this._state.dataList = this._state.dataList.push(newValues);
    }

    getErrors ()
    {
        return this._state.errorList.last().toJS();
    }

    setErrors (errors)
    {
        this._state.errorList = this._state.errorList.push(Immutable.fromJS(errors));
    }

    addErrors (errors)
    {
        const newErrors = this._state.errorList.last().merge(Immutable.fromJS(errors));
        this._state.errorList = this._state.errorList.push(newErrors);
    }

    get isUpdated ()
    {
        return this._state.dataList.size > 1;
    }

    get hasErrors () {
        return this._state.errorList.last().filter((v) => v.size > 0).size > 0;
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