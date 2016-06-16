import co from 'co';
import { convertTo } from './type';
import { SimpleOdmError } from './errors';
import Immutable from 'immutable';

/**
 * @param value {*}
 * @returns {boolean}
 */
const checkIfEmpty = (value) => value === "" || value === undefined;

/**
 * @param path {Path}
 * @param value {*}
 * @param updated {boolean}
 * @returns {Promise.<Immutable.List>}
 */
const inspectErrors = ({path, value, updated}) =>
    co(function* ()
    {
        let errorMessages = Immutable.List();
        const isEmpty = checkIfEmpty(value);

        if (isEmpty && !updated && path.isRequiredWhenCreated) {
            return errorMessages.push(path.requiredWhenCreatedErrorMessageBuilder());
        }

        if (isEmpty && updated && path.isRequiredWhenUpdated) {
            return errorMessages.push(path.requiredWhenUpdatedErrorMessageBuilder());
        }

        if (isEmpty) {
            return errorMessages;
        }

        try {
            convertTo(value, path.type);
        } catch (error) {
            return errorMessages.push(path.typeErrorMessageBuilder(value));
        }

        const iterator = path.validator(path.sanitizer(value));

        for (let message of iterator) {
            errorMessages = errorMessages.push(message);
        }

        return errorMessages;
    });

export default {inspectErrors};