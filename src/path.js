import { SimpleOdmError } from './errors';
import Types from './types';
import typeFunctions from './type-functions';

const requiredErrorDefaultMessage = function ()
{
    return `The ${this.displayName} is required.`;
};

const uniqueErrorDefaultMessage = function (value)
{
    return `The ${this.displayName}, "${value}", has already been taken.`;
};

const typeErrorDefaultMessage = function (value)
{
    return `The ${this.displayName}, "${value}", is invalid.`;
};

const defaultSanitizer = (value) => value;

const defaultValidator = function*() {};

const DETAULT_TYPE = Types.String;

export default class Path {

    /**
     * @param name {string}
     * @param [options = {}] {Object}
     * @param options.display_name {string}
     * @param options.type {Type|Array|object}
     * @param options.default_value {*}
     * @param options.unique {boolean|function}
     * @param options.projected {boolean}
     * @param options.required {boolean|function|object|Array}
     * @param options.sanitize {function}
     * @param options.validate {function}
     */
    constructor (name, options = {})
    {

        if (typeof name !== "string")
        {
            throw new SimpleOdmError(`The path name has to be string.`);
        }

        if (typeof options !== "object"
            || options === null
            || Array.isArray(options))
        {
            throw new SimpleOdmError(`The options argument of "${name}" has to be an object.`);
        }

        if (options.hasOwnProperty('display_name')
            && typeof options.display_name !== "string")
        {
            throw new SimpleOdmError(`The display name of "${name}" has to be string.`);
        }

        if (options.hasOwnProperty('type')
            && !typeFunctions.isValidType(options.type))
        {
            throw new SimpleOdmError(`The type attribute of "${name}" has to be a type.`);
        }

        if (options.hasOwnProperty('default_value'))
        {
            const type = options.type || DETAULT_TYPE;
            if (!typeFunctions.isValidValueAs(options.default_value, type))
            {
                throw new SimpleOdmError(`The default value of "${name}" is not valid as the "${type}" type.`);
            }
        }

        if (options.hasOwnProperty('unique')
            && typeof options.unique !== "boolean"
            && typeof options.unique !== "function")
        {
            throw new SimpleOdmError(`The unique attribute of "${name}" has to be either boolean or a function.`);
        }

        if (options.hasOwnProperty('projected')
            && typeof options.projected !== "boolean")
        {
            throw new SimpleOdmError(`The projected attribute of "${name}" has to be boolean.`);
        }

        if (options.hasOwnProperty('required')
            && typeof options.required !== "boolean"
            && typeof options.required !== "function"
            && typeof options.required !== "object"
            && !Array.isArray(options.required))
        {
            throw new SimpleOdmError(`The require attribute of "${name}" has to be either boolean, an array, a function or an object.`);
        }

        if (options.hasOwnProperty('sanitize')
            && typeof options.sanitize !== "function")
        {
            throw new SimpleOdmError(`The sanitize attribute of "${name}" has to be a function.`);
        }

        if (options.hasOwnProperty('validate')
            && typeof options.validate !== "function")
        {
            throw new SimpleOdmError(`The validate attribute of "${name}" has to be a function.`);
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

        if (typeof required === "boolean" || !options.hasOwnProperty('required'))
        {
            this._required_created = !!required;
            this._required_updated = !!required;
            this._required_created_err_msg = requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = requiredErrorDefaultMessage.bind(this);
        }
        else if (typeof required === "function")
        {
            this._required_created = true;
            this._required_updated = true;
            this._required_created_err_msg = required.bind(this);
            this._required_updated_err_msg = required.bind(this);
        }
        else if (Array.isArray(required))
        {
            this._required_created = required.indexOf('created') !== -1;
            this._required_updated = required.indexOf('updated') !== -1;
            this._required_created_err_msg = requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = requiredErrorDefaultMessage.bind(this);
        }
        else if (typeof required === "object")
        {
            const created = required.created;
            const updated = required.updated;
            this._required_created = !!created;
            this._required_updated = !!updated;
            this._required_created_err_msg = (typeof created === "function") ? created.bind(this) : requiredErrorDefaultMessage.bind(this);
            this._required_updated_err_msg = (typeof updated === "function") ? updated.bind(this) : requiredErrorDefaultMessage.bind(this);
        }

        this._sanitizer = options.sanitize ? options.sanitize.bind(this) : defaultSanitizer;

        this._validator = options.validate ? options.validate.bind(this) : defaultValidator;

        Object.freeze(this._type);
        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    get name ()
    {
        return this._name;
    }

    /**
     * @returns {string}
     */
    get displayName ()
    {
        return this._display_name || this.name;
    }

    /**
     * @returns {Symbol}
     */
    get type ()
    {
        return this._type;
    }

    /**
     * @returns {*}
     */
    get defaultValue ()
    {
        return this._default_value;
    }

    /**
     * @returns {boolean}
     */
    get isUnique ()
    {
        return this._unique;
    }

    /**
     * @returns {boolean}
     */
    get isProjected ()
    {
        return this._projected;
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenCreated ()
    {
        return this._required_created;
    }

    /**
     * @returns {boolean}
     */
    get isRequiredWhenUpdated ()
    {
        return this._required_updated;
    }

    /**
     * @returns {function(this:Path)}
     */
    get requiredWhenCreatedErrorMessageBuilder ()
    {
        return this._required_created_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get requiredWhenUpdatedErrorMessageBuilder ()
    {
        return this._required_updated_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get uniqueErrorMessageBuilder ()
    {
        return this._unique_err_msg;
    }

    /**
     * @returns {function(this:Path)}
     */
    get typeErrorMessageBuilder ()
    {
        return typeErrorDefaultMessage.bind(this);
    }

    /**
     * @returns {function(this:Path)}
     */
    get sanitizer ()
    {
        return this._sanitizer;
    }

    /**
     * @returns {function}
     */
    get validator ()
    {
        return this._validator;
    }
}