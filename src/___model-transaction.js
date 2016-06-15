import co from 'co';
import SchemaModel from './schema-model';
import { SimpleOdmError } from './errors';

export default class ModelTransaction {

    /**
     * @param modifiedModel {SchemaModel}
     * @param [originalModel] {SchemaModel}
     */
    constructor(modifiedModel = null,
                originalModel = null)
    {
        if (modifiedModel !== null && !(modifiedModel instanceof SchemaModel)) {
            throw new SimpleOdmError('A modified model argument has to be a SchemaModel object.');
        }

        if (originalModel !== null && !(originalModel instanceof SchemaModel)) {
            throw new SimpleOdmError('An original model argument has to be a SchemaModel object.');
        }

        this._modifiedModel = modifiedModel;
        this._originalModel = originalModel;

        Object.freeze(this);
    }

    execute() {
        const modifiedModel = this._modifiedModel;
        const originalModel = this._originalModel;
        const errorMessageMap = this._errorMessageMap;
        const updated = !!originalModel;
        const transaction = this;

        return co(function* () {
            const errorMap = modifiedModel.inspectErrors({updated});
            const ret = yield modifiedModel.onCreate(transaction);
        });
    }

}