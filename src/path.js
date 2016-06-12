import { SimpleOdmError } from './errors';
import { Types, isValidType, isValidValueAs } from './type';

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

const defaultValidator = function*() {};

const DETAULT_TYPE = Types.String;

export default class Path {

    /**
     * @param name {string}
     * @param [options = {}] {Object}
     */
    constructor(name, options = {}) {

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
            && !isValidType(options.type)) {
            throw new SimpleOdmError('A type attribute has to be a type.');
        }

        if (options.hasOwnProperty('default_value')) {
            const type = options.type || DETAULT_TYPE;
            if (!isValidValueAs(options.default_value, type)) {
                throw new SimpleOdmError(`The default value is not valid as the "${type}" type.`);
            }
        }

        if (options.hasOwnProperty('unique')
            && typeof options.unique !== "boolean"
            && typeof options.unique !== "function") {
            throw new SimpleOdmError('The unique attribute has to be either boolean or a function.');
        }

        if (options.hasOwnProperty('projected')
            && typeof options.projected !== "boolean") {
            throw new SimpleOdmError('The projected attribute has to be boolean.');
        }

        if (options.hasOwnProperty('required')
            && typeof options.required !== "boolean"
            && typeof options.required !== "function"
            && typeof options.required !== "object"
            && !Array.isArray(options.required)) {
            throw new SimpleOdmError('The require attribute has to be either boolean, an array, a function or an object.');
        }

        if (options.hasOwnProperty('sanitize')
            && typeof options.sanitize !== "function") {
            throw new SimpleOdmError('The sanitize attribute has to be a function.');
        }

        if (options.hasOwnProperty('validate')
            && !(options.validate instanceof (defaultValidator).constructor)) {
            throw new SimpleOdmError('The validate attribute has to be a generator function.');
        }

        this._name = name;
        this._display_name = options.display_name;
        this._type = options.type || DETAULT_TYPE;
        this._default_value = options.default_value;

        this._unique = !!options.unique;
        this._unique_err_msg = (typeof options.unique === "function")
            ? options.unique.bind(this)
            : uniqueErrorDefaultMessage.bind(this);

        this._projected = options.projected === false ? false : true;

        const required = options.required;

        if (typeof required === "boolean" || !options.hasOwnProperty('required')) {
            this._required_created = !!required;
            this._required_updated = !!required;
            this._required_created_err_msg = requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = requiredErrorDefaultMessage.bind(this);
        } else if (typeof required === "function") {
            this._required_created = true;
            this._required_updated = true;
            this._required_created_err_msg = required.bind(this);
            this._required_updated_err_msg = required.bind(this);
        } else if (Array.isArray(required)) {
            this._required_created = required.indexOf('created') !== -1;
            this._required_updated = required.indexOf('updated') !== -1;
            this._required_created_err_msg = requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = requiredErrorDefaultMessage.bind(this);
        } else if (typeof required === "object") {
            const created = required.created;
            const updated = required.updated;
            this._required_created = !!created;
            this._required_updated = !!updated;
            this._required_created_err_msg = (typeof created === "function") ? created.bind(this) : requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = (typeof updated === "function") ? updated.bind(this) : requiredErrorDefaultMessage.bind(this);
        }

        this._sanitizer = options.sanitize ? options.sanitize.bind(this) : defaultSanitizer;

        this._validator = options.validate ? options.validate.bind(this) : defaultValidator;

        Object.freeze(this);
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
        return this._display_name || this.name;
    }

    /**
     * @returns {Symbol}
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {*}
     */
    get defaultValue() {
        return this._default_value;
    }

    /**
     * @returns {boolean}
     */
    get isUnique() {
        return this._unique;
    }

    /**
     * @returns {boolean}
     */
    get isProjected() {
        return this._projected;
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenCreated() {
        return this._required_created;
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenUpdated() {
        return this._required_updated;
    }

    /**
     * @returns {function(this:Path)}
     */
    get requiredWhenCreatedErrorMessageBuilder() {
        return this._required_created_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get requiredWhenUpdatedErrorMessageBuilder() {
        return this._required_updated_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get uniqueErrorMessageBuilder() {
        return this._unique_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get typeErrorMessageBuilder() {
        return typeErrorDefaultMessage.bind(this);
    }

    /**
     * @returns {function(this:Path)}
     */
    get sanitizer() {
        return this._sanitizer;
    }

    /**
     * @returns {GeneratorFunction}
     */
    get validator() {
        return this._validator;
    }
}