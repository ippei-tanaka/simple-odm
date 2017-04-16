import typeFunctions from './type-functions';
import { SimpleOdmError } from './errors';

/**
 * @param value {*}
 * @returns {boolean}
 */
const checkIfEmpty = (value) => value === "" || value === undefined;

/**
 * @param path {Path}
 * @param value {*}
 * @param updated {boolean}
 * @returns {Promise.<Array>}
 */
const inspectErrors = async ({path, value, updated}) =>
{
    let errorMessages = [];
    const isEmpty = checkIfEmpty(value);

    if (isEmpty && !updated && path.isRequiredWhenCreated)
    {
        errorMessages.push(path.requiredWhenCreatedErrorMessageBuilder());
        return errorMessages;
    }

    if (isEmpty && updated && path.isRequiredWhenUpdated)
    {
        errorMessages.push(path.requiredWhenUpdatedErrorMessageBuilder());
        return errorMessages;
    }

    if (isEmpty)
    {
        return errorMessages;
    }

    try
    {
        typeFunctions.convertTo(value, path.type);
    } catch (error)
    {
        errorMessages.push(path.typeErrorMessageBuilder(value));
        return errorMessages;
    }

    const result = path.validator(path.sanitizer(value));

    if (typeof result === "string")
    {
        errorMessages.push(result);
    }
    else
    {
        for (let message of result)
        {
            errorMessages.push(String(message));
        }
    }

    return errorMessages;
};

/**
 * @param path {Path}
 * @param value {*}
 * @returns {Promise.<*>}
 */
const getFormattedValue = async ({path, value}) =>
{
    return path.sanitizer(typeFunctions.convertTo(value, path.type));
};

export default {inspectErrors, getFormattedValue};