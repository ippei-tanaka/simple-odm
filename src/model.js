import co from 'co';
import schemaFunctions from './schema-functions';
import SchemaData from './schema-data';
import Immutable from 'immutable';

export default class Model {

    static bindDependencies({operator, schema}) {
        return this.bind(null, operator, schema);
    }

    /**
     * @param operator {CrudOperator}
     * @param schema {Schema}
     */
    constructor(operator,
                schema,
                values)
    {
        this._schema = schema;
        this._operator = operator;
        this._values = Immutable.Map(values);
        Object.freeze(this);
    }

    findMany({query = {}, sort = {}, limit = 0, skip = 0} = {}) {
        const Model = SchemaModel.createModel({schema: this._schema});
        const operator = this._operator;

        return co(function* () {
            const docs = yield operator.findMany(query, sort, limit, skip);
            return docs.map(doc => new Model(doc));
        });
    }

    findOne(query) {
        const Model = SchemaModel.createModel({schema: this._schema});
        const operator = this._operator;

        return co(function* () {
            const doc = yield operator.findOne(query);
            return doc ? new Model(doc) : null;
        });
    }

    aggregate(query) {
        return co(function* () {
            return yield this._operator.aggregate(query);
        }.bind(this));
    }

    save () {
        const schema = this._schema;
        const values = this._values;
        const operator = this._operator;

        return co(function* () {
            const errorMessages = yield schemaFunctions.inspectErrorsOnCreate({schema, values});

            let data = new SchemaData({values, errorMessages});

            data = yield schemaFunctions.executeOnCreateHook({schema, data});

            if (data.hasErrors) {
                throw data.errorMessages.toJS();
            }

            return yield operator.insertOne(data.values.toJS());
        });
    }

    update (query, values) {
        const Model = InspectedUpdatedSchemaModel.createModel({schema: this._schema});

        return co(function* () {
            const originalModel = yield findOne(query);
            const updatedModel = new Model(originalModel, values);

            //const errorMap = model.examine();
            //const ret = yield model.onCreate(errorMap);
            return yield this._executeDbOperation(ret);
        }.bind(this)).catch((errorMap) => {
            throw new ValidationErrorMap(errorMap);
        });
    }

}