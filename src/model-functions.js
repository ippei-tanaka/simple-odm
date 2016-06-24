import co from 'co';
import pathFunctions from './path-functions';

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

const createIdQuery = (key, id) => id ? {[key]: id} : null;

const isObject = a => typeof a === 'object' && a !== null;

const generateRefinedValues = ({schema, values}) => co(function* ()
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
});

export default Object.freeze({
    inspectErrors,
    createIdQuery,
    isObject,
    generateRefinedValues
});