import { SimpleOdmError } from './errors';

export default class Driver {

    constructor () {
        throw new SimpleOdmError("Cannot create an instance of Driver class");
    }

    static connect ()
    {
        throw new SimpleOdmError("Implement connect")
    }

    static  disconnect ()
    {
        throw new SimpleOdmError("Implement disconnect")
    }

    static setUp ()
    {
        throw new SimpleOdmError("Implement setUp")
    }

}