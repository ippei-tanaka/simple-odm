import { SimpleOdmError } from './errors';

export default class CrudOperator {

    constructor ()
    {
        throw new SimpleOdmError("Cannot create an instance of CrudOperator class");
    }

    static findMany ()
    {
        throw new SimpleOdmError("Implement findMany")
    }

    static findOne ()
    {
        throw new SimpleOdmError("Implement findOne")
    }

    static insertOne ()
    {
        throw new SimpleOdmError("Implement insertOne")
    }

    static updateOne ()
    {
        throw new SimpleOdmError("Implement updateOne")
    }

    static deleteOne ()
    {
        throw new SimpleOdmError("Implement deleteOne")
    }

    static aggregate ()
    {
        throw new SimpleOdmError("Implement aggregate")
    }

}