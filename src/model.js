import co from 'co';
import { SimpleOdmError } from './errors';
import Immutable from 'immutable';
import Schema from './schema';
import pathFunctions from './path-functions';


class Model {

    /**
     * @param operator {CrudOperator}
     * @param schema {Schema}
     * @param values {object}
     */
    constructor ({operator, schema}, values = {})
    {
        if (typeof values !== 'object' || values === null)
        {
            throw new SimpleOdmError("The values argument has to be an object");
        }

        this._schema = schema;
        this._operator = operator;

        this._state = {
            dataList: Immutable.fromJS([values]),
            errorList: Immutable.List()
        };

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

    executeOnSaveHook ()
    {
        const schema = this._schema;
        const model = this;

        return co(function* ()
        {
            return schema.emit(Schema.SAVE, model);
        })
    }

    inspectErrors ()
    {
        const schema = this._schema;
        const updated = this.isUpdated;
        const values = this.getValues();

        return co(function* ()
        {
            let errorMessages = {};

            for (let path of schema)
            {
                const value = values[path.name];
                errorMessages[path.name] = yield pathFunctions.inspectErrors({path, value, updated});
            }

            return errorMessages;
        });
    }

    getProcessedValues () {
        const schema = this._schema;
        const values = this.getValues();

        return co(function* ()
        {
            let obj = {};

            for (let path of schema)
            {
                const value = values[path.name];

                try {
                    obj[path.name] = yield pathFunctions.getProcessedValue({path, value});
                } catch (e) {}
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

    getErrors ()
    {
        return this._state.errorList.last().toJS();
    }

    setErrors (errors)
    {
        this._state.errorList = this._state.errorList.push(Immutable.fromJS(errors));
    }

    get isUpdated ()
    {
        return this._state.dataList.size > 1;
    }

    save ()
    {
        return co(function* ()
        {
            this.setErrors(yield this.inspectErrors());

            yield this.executeOnSaveHook();

            if (this._state.errorList.last().filter((v) => v.size > 0).size > 0)
            {
                throw this.getErrors();
            }

            return yield this._operator.insertOne(this.getProcessedValues());

        }.bind(this));
    }

}

Object.freeze(Model);

export default Model;