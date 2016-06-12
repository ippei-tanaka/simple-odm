import { ObjectID } from 'mongodb';
import UUID_Validate from "uuid-validate";
import { SimpleOdmError } from './errors';

class Type {
    constructor(name) {
        Object.defineProperty(this, "_name", {value: name});
    }

    toString() {
        return this._name;
    }
}

const checkIfMongoObjectId = (value) => {
    let err = null;
    try {
        ObjectID(value);
    } catch (e) {
        err = e;
    }
    return err === null;
};

export const Types = Object.freeze({
    String: new Type("String"),
    Integer: new Type("Integer"),
    Date: new Type("Date"),
    Boolean: new Type("Boolean"),
    MongoObjectID: new Type("MongoObjectID"),
    UUID: new Type("UUID")
});

export const isValidValueAs = (value, type) => {
    switch (type) {
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
            return false;
    }
};

export const convertTo = (value, type) => {

    if (Array.isArray(type)) {
        if (!Array.isArray(value))
            throw new SimpleOdmError(`"${value}" couldn't be converted to an array.`);
        return value.map((i) => convertTo(i, type[0]));
    }

    switch (type) {
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
            return value;
    }
};

export const isValidType = (value) => {
    let isType = false;

    if (Array.isArray(value)) {
        isType = value.map((i) => isValidType(i)).filter((i) => i === false).length === 0;
    }

    for (let key of Object.keys(Types)) {
        if (value === Types[key]) {
            isType = true;
        }
    }

    return isType;
};

export default Types;