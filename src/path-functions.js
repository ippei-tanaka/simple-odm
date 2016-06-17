import co from 'co';
import { convertTo } from './type';
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
const inspectErrors = ({path, value, updated}) =>
    co(function* ()
    {
        let errorMessages = [];
        const isEmpty = checkIfEmpty(value);

        if (isEmpty && !updated && path.isRequiredWhenCreated) {
            errorMessages.push(path.requiredWhenCreatedErrorMessageBuilder());
            return errorMessages;
        }

        if (isEmpty && updated && path.isRequiredWhenUpdated) {
            errorMessages.push(path.requiredWhenUpdatedErrorMessageBuilder());
            return errorMessages;
        }

        if (isEmpty) {
            return errorMessages;
        }

        try {
            convertTo(value, path.type);
        } catch (error) {
            errorMessages.push(path.typeErrorMessageBuilder(value));
            return errorMessages;
        }

        const iterator = path.validator(path.sanitizer(value));

        for (let message of iterator) {
            errorMessages.push(message);
        }

        return errorMessages;
    });

/**
 * @param path {Path}
 * @param value {*}
 * @returns {Promise.<*>}
 */
const getProcessedValue = ({path, value}) =>
    co(function* ()
    {
        return path.sanitizer(convertTo(value, path.type));
    });

export default {inspectErrors, getProcessedValue};