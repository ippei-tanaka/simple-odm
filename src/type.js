export default class Type {

    /**
     * @param {string} name - the name of the type
     */
    constructor (name)
    {
        Object.defineProperty(this, "_name", {value: String(name)});
    }

    /**
     * @return {string}
     */
    toString ()
    {
        return this._name;
    }
}