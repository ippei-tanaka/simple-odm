export default class SchemaData {

    /**
     * @param values {Immutable.Map}
     * @param errorMessages {Immutable.Map}
     */
    constructor({values, errorMessages})
    {
        this._values = values;
        this._errorMessages = errorMessages;
        Object.freeze(this);
    }

    get values()
    {
        return this._values;
    }

    get errorMessages()
    {
        return this._errorMessages;
    }

    get hasErrors()
    {
        for (let messages of this._errorMessages.values()) {
            if (messages.size > 0) {
                return true;
            }
        }
        return false;
    }

}