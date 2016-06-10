import { ObjectID } from 'mongodb';
import UUID_Validate from "uuid-validate";

class Type
{
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

export const isTypeObject = (value) => {
    let isType = false;

    for (let key of Object.keys(Types)) {
        if (value === Types[key]) {
            isType = true;
        }
    }

    return isType;
};

export default Types;