import co from 'co';
import pathFunctions from './path-functions';
import Schema from './schema';

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
 * @return {Promise.<object>}
 */
const getProcessedValues = ({schema, values}) =>
    co(function* ()
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
    });

export default {
    inspectErrors,
    getProcessedValues
}