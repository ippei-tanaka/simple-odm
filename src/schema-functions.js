import co from 'co';
import pathFunctions from './path-functions';

/**
 * @param schema {Schema}
 * @param values {object}
 * @param updated {boolean}
 * @return {Promise.<object>}
 */
const inspectErrors = ({schema, values, updated}) =>
    co(function* ()
    {
        let errorMessages = {};

        for (let path of schema)
        {
            const value = values[path.name];
            errorMessages[path.name] = yield pathFunctions.inspectErrors({path, value, updated});
        }

        return errorMessages;
    });

/**
 * @param schema {Schema}
 * @param values {object}
 * @returns {Promise.<object>}
 */
const inspectErrorsOnCreate = ({schema, values}) =>
{
    return inspectErrors({schema, values, updated: false});
};

/**
 * @param schema {Schema}
 * @param values {object}
 * @returns {Promise.<object>}
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

/**
 * @param schema {Schema}
 * @param data {SchemaData}
 */
const executeOnUpdateHook = ({schema, data}) =>
    co(function* ()
    {
        return yield schema.onUpdate(data);
    });

export default {
    inspectErrorsOnCreate,
    inspectErrorsOnUpdate,
    executeOnCreateHook,
    executeOnUpdateHook
}