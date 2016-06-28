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

const createValueObjectWithId = ({values, idPathName, idGetter}) =>
{
    const _values = Object.assign({}, values);

    if (typeof idPathName === "string" && idPathName !== "")
    {
        Object.defineProperty(_values, idPathName, {
            get: idGetter
        });
    }

    return _values;
};

const createIdQuery = (key, id) => id ? {[key]: id} : null;

const isObject = a => typeof a === 'object' && a !== null;

const generateFormattedValues = ({schema, values}) => co(function* ()
{
    let obj = Object.assign({}, values);

    for (let path of schema)
    {
        const value = values[path.name];

        try
        {
            obj[path.name] = yield pathFunctions.getFormattedValue({path, value});
        }
        catch (e)
        {
            obj[path.name] = undefined;
        }
    }

    return obj;
});

const findDifference = (obj1, obj2) =>
{
    const obj = {};

    for (const key of Object.keys(obj1))
    {
        const value1 = obj1[key];
        const value2 = obj2[key];

        if (value1 !== value2)
        {
            obj[key] = value2;
        }
    }

    return obj;
};

export default Object.freeze({
    inspectErrors,
    createIdQuery,
    isObject,
    generateFormattedValues,
    findDifference,
    createValueObjectWithId
});