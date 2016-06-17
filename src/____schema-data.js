import Immutable from 'immutable';
import { SimpleOdmError } from './errors';

export default class SchemaData {

    /**
     * @param values {object}
     * @param errorMessages {object.<Array.<string>>}
     */
    constructor ({values = {}, errorMessages = {}} = {})
    {
        if (typeof values !== 'object' || values === null)
        {
            throw new SimpleOdmError("The values argument has to be an object");
        }

        if (typeof errorMessages !== 'object' || errorMessages === null)
        {
            throw new SimpleOdmError("The errorMessages argument has to be an object");
        }

        for (let key of Object.keys(errorMessages))
        {
            const messageList = errorMessages[key];

            if (!Array.isArray(messageList))
            {
                throw new SimpleOdmError("Each value of errorMessages argument has to be an array");
            }

            messageList.forEach((message) =>
            {
                if (typeof message !== 'string')
                {
                    throw new SimpleOdmError("Each value of errorMessages argument List has to be string");
                }
            })
        }

        this._values = Immutable.fromJS(values);
        this._errorMessages = Immutable.fromJS(errorMessages);

        Object.freeze(this);
    }

    get values ()
    {
        return this._values.toJS();
    }

    get errorMessages ()
    {
        return this._errorMessages.toJS();
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