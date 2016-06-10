import { SimpleOdmError } from './errors';
import { Types, isTypeObject, isValidValueAs } from './type';

const requiredErrorDefaultMessage = function () {
    return `The ${this.displayName} is required.`;
};

const uniqueErrorDefaultMessage = function (value) {
    return `The ${this.displayName}, "${value}", has already been taken.`;
};

const typeErrorDefaultMessage = function (value) {
    return `The ${this.displayName}, "${value}", is invalid.`;
};

const defaultSanitizer = (value) => value;

export default class Path {

    /**
     * @param name {string}
     * @param [options = {}] {Object}
     */
    constructor(name, options = {}) {

        this._name = name;
        this._options = options;

        if (typeof name !== "string") {
            throw new SimpleOdmError('A path name has to be string.');
        }

        if (typeof options !== "object") {
            throw new SimpleOdmError('An options argument has to be an object.');
        }

        if (options.hasOwnProperty('display_name')
            && typeof options.display_name !== "string") {
            throw new SimpleOdmError('A display name has to be string.');
        }

        if (options.hasOwnProperty('type')
            && !isTypeObject(options.type)) {
            throw new SimpleOdmError('A type attribute has to be a type.');
        }

        if (options.hasOwnProperty('default_value')
            && !isValidValueAs(options.default_value, this.type)) {
            throw new SimpleOdmError(`The default value is not valid as the "${this.type}" type.`);
        }
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string}
     */
    get displayName() {
        return this._options.display_name || this.name;
    }

    /**
     * @returns {Symbol}
     */
    get type() {
        return this._options.type || Types.String;
    }

    /**
     * @returns {*}
     */
    get defaultValue() {
        return this._options.default_value;
    }

    /**
     * @returns {boolean}
     */
    get isUnique() {
        return !!this._options.unique;
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenCreated() {
        const required = this._options.required;
        return required === true || (Array.isArray(required) && required.indexOf('created') !== -1);
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenUpdated() {
        const required = this._options.required;
        return required === true || (Array.isArray(required) && required.indexOf('updated') !== -1);
    }

    get requiredErrorMessageBuilder() {
        if (typeof this._options.required === 'function') {
            return this._options.required.bind(this);
        } else {
            return requiredErrorDefaultMessage.bind(this);
        }
    }

    get uniqueErrorMessageBuilder() {
        if (typeof this._options.unique === 'function') {
            return this._options.unique.bind(this);
        } else {
            return uniqueErrorDefaultMessage.bind(this);
        }
    }

    get typeErrorMessageBuilder() {
        return typeErrorDefaultMessage.bind(this);
    }

    /**
     * @returns {function}
     */
    get sanitizer() {
        return typeof this._options.sanitize === 'function'
            ? this._options.sanitize.bind(this)
            : defaultSanitizer;
    }

    /**
     * @returns {GeneratorFunction}
     */
    get validator() {
        return typeof this._options.validate === 'function'
            ? this._options.validate.bind(this)
            : function* (value) {};
    }
}