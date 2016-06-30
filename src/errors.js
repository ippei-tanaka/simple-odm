class ExtendableError extends Error {
    constructor (message)
    {
        super(message);

        this.name = this.constructor.name;
        this.message = message;

        if (typeof Error.captureStackTrace === 'function')
        {
            Error.captureStackTrace(this, this.constructor);
        }
        else
        {
            this.stack = (new Error(message)).stack;
        }
    }

    toJSON ()
    {
        return {
            name: this.name,
            message: this.message
        };
    }
}

export class SimpleOdmError extends ExtendableError {
    constructor (message)
    {
        super(message);
    }
}

export class SimpleOdmValidationError extends ExtendableError  {

    constructor (map)
    {
        super(map);
    }

}