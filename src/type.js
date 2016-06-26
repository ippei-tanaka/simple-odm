export default class Type {

    constructor(name) {
        Object.defineProperty(this, "_name", {value: name});
    }

    toString() {
        return this._name;
    }
}