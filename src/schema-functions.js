import co from 'co';
import pathFunctions from './path-functions';
import Immutable from 'immutable';

/**
 * @param schema {Schema}
 * @param values {Immutable.Map}
 * @param updated {boolean}
 * @return {Promise.<Immutable.Map>}
 */
const inspectErrors = ({schema, values, updated}) =>
    co(function* ()
    {
        let errorMessages = Immutable.Map();

        for (let path of schema) {
            const value = values.get(path.name);
            const messageList = yield pathFunctions.inspectErrors({path, value, updated});
            errorMessages = errorMessages.set(path.name, messageList);
        }

        return errorMessages;
    });

/**
 * @param schema {Schema}
 * @param values {Immutable.Map}
 * @returns {Promise.<Immutable.Map>}
 */
const inspectErrorsOnCreate = ({schema, values}) =>
{
    return inspectErrors({schema, values, updated: false});
};

/**
 * @param schema {Schema}
 * @param values {Immutable.Map}
 * @returns {Promise.<Immutable.Map>}
 */
const inspectErrorsOnUpdate = ({schema, values}) =>
{
    return inspectErrors({schema, values, updated: true});
};

/**
 * @param schema {Schema}
 * @param data {SchemaData}
 */
const executeOnCreateHook = ({schema, data}) =>
    co(function* ()
    {
        return yield schema.onCreate(data);
    });

export default {
    inspectErrorsOnCreate,
    inspectErrorsOnUpdate,
    executeOnCreateHook
}