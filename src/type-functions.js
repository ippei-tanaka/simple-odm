import { ObjectID } from 'mongodb';
import UUID_Validate from "uuid-validate";
import { SimpleOdmError } from './errors';
import Types from './types';

const checkIfMongoObjectId = (value) =>
{
    let err = null;
    try
    {
        ObjectID(value);
    } catch (e)
    {
        err = e;
    }
    return err === null;
};

const isValidValueAs = (value, type) =>
{

    switch (type)
    {
        case Types.String:
            return typeof value === "string";

        case Types.Integer:
            return (typeof value === "number" && Number.parseInt(value) === value);

        case Types.Date:
            return value instanceof Date;

        case Types.Boolean:
            return typeof value === "boolean";

        case Types.MongoObjectID:
            return checkIfMongoObjectId(value);

        case Types.UUID:
            return UUID_Validate(value);

        default:
            break;
    }

    if (Array.isArray(type))
    {
        if (!Array.isArray(value)) return false;
        return value.map(i => isValidValueAs(i, type[0])).filter((i) => i === false).length === 0;
    }
    else if (typeof type === "object" && type !== null)
    {
        if (typeof value !== "object" || value === null || Array.isArray(value))
            return false;


        for (let key of Object.keys(type))
        {
            if (value.hasOwnProperty(key)
                && !isValidValueAs(value[key], type[key]))
            {
                return false;
            }
        }

        return true;
    }

    return false;
};

const convertTo = (value, type) =>
{
    switch (type)
    {
        case Types.String:
            return String(value);
        case Types.Integer:
            const num = Number.parseInt(value);
            if (Number.isNaN(num))
                throw new SimpleOdmError(`"${value}" couldn't be converted to ${type}.`);
            return num;
        case Types.Date:
            const date = new Date(value);
            if (Number.isNaN(date.valueOf()))
                throw new SimpleOdmError(`"${value}" couldn't be converted to ${type}.`);
            return date;
        case Types.Boolean:
            return !!value;
        case Types.MongoObjectID:
            return ObjectID(value);
        case Types.UUID:
            if (!UUID_Validate(value))
                throw new SimpleOdmError(`"${value}" couldn't be converted to ${type}.`);
            return value;
        default:
            break;
    }

    if (Array.isArray(type))
    {
        if (!Array.isArray(value))
            throw new SimpleOdmError(`"${value}" couldn't be converted to an array.`);

        return value.map((i) => convertTo(i, type[0]));
    }
    else if (typeof type === "object" && type !== null)
    {
        const obj = {};
        for (let key of Object.keys(type))
        {
            if (value.hasOwnProperty(key))
            {
                obj[key] = convertTo(value[key], type[key]);
            }
        }
        return obj;
    }

    return value
};

const isValidType = (value) =>
{
    let isType = false;

    for (let key of Object.keys(Types))
    {
        if (value === Types[key])
        {
            isType = true;
        }
    }

    if (Array.isArray(value))
    {
        isType = value.map((i) => isValidType(i)).filter((i) => i === false).length === 0;
    }
    else if (typeof value === "object" && value !== null)
    {
        isType = Object.keys(value).map((k) => isValidType(value[k])).filter((i) => i === false).length === 0;
    }

    return isType;
};

export default {
    isValidValueAs,
    convertTo,
    isValidType
}