import { SimpleOdmError } from './errors';

export default class DbUtils {

    constructor ()
    {
        throw new SimpleOdmError("Cannot create an instance of DbUtils class");
    }

    static createUniqueIndex ()
    {
        throw new SimpleOdmError("Implement createUniqueIndex")
    }

    static createIndex ()
    {
        throw new SimpleOdmError("Implement createIndex")
    }

    static getIndexInfo ()
    {
        throw new SimpleOdmError("Implement getIndexInfo")
    }

    static dropIndex ()
    {
        throw new SimpleOdmError("Implement dropIndex")
    }

    static dropDatabase ()
    {
        throw new SimpleOdmError("Implement dropDatabase")
    }

}