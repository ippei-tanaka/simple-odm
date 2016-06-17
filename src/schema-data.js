import Immutable from 'immutable';
import { SimpleOdmError } from './errors';

export default class SchemaData {

    /**
     * @param values {Immutable.Map.<*>}
     * @param errorMessages {Immutable.Map.<Immutable.List.<string>>}
     */
    constructor ({values, errorMessages})
    {
        if (!(errorMessages instanceof Immutable.Map))
        {
            throw new SimpleOdmError("The errorMessages argument has to be Immutable.Map");
        }

        errorMessages.forEach((messageList) =>
        {
            if (!(messageList instanceof Immutable.List))
            {
                throw new SimpleOdmError("Each value of errorMessages argument has to be Immutable.List");
            }

            messageList.forEach((message) =>
            {
                if (typeof message !== 'string')
                {
                    throw new SimpleOdmError("Each value of errorMessages argument List has to be string");
                }
            })
        });

        this._values = values;
        this._errorMessages = errorMessages;
        Object.freeze(this);
    }

    get values ()
    {
        return this._values;
    }

    get errorMessages ()
    {
        return this._errorMessages;
    }

    get hasErrors ()
    {
        for (let messages of this._errorMessages.values())
        {
            if (messages.size > 0)
            {
                return true;
            }
        }
        return false;
    }

}