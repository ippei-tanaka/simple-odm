import { TYPES, convertTo, isValidType } from './type';
import { SimpleOdmError } from './errors';
import Path from './path';

const checkIfEmpty = (value) => value === "" || value === undefined;

class PathModel {

    /**
     * @param path {Path}
     * @param value {*}
     */
    constructor(path, value) {
        if (!(path instanceof Path)) {
            throw new SimpleOdmError('A path argument has to be a Path object.');
        }

        this._path = path;

        this._rowValue = value;

        Object.freeze(this);
    }

    get normalizedValue() {
        try {
            if (this._rowValue === undefined
                || this._rowValue === null) {
                return this._rowValue;
            }
            return convertTo(this._rowValue, this._path.type);
        } catch (error) {
            return undefined;
        }
    }

    examine({updated}) {

        const rowValue = this._rowValue;
        const isEmpty = checkIfEmpty(rowValue);
        const path = this._path;

        if (isEmpty && !updated && path.isRequiredWhenCreated) {
            throw [path.requiredWhenCreatedErrorMessageBuilder()];
        }

        if (isEmpty && updated && path.isRequiredWhenUpdated) {
            throw [path.requiredWhenUpdatedErrorMessageBuilder()];
        }

        if (isEmpty) {
            return true;
        }

        try {
            convertTo(rowValue, path.type);
        } catch (error) {
            throw [path.typeErrorMessageBuilder(rowValue)];
        }

        const messages = [];
        const iterator = path.validator(path.sanitizer(rowValue));

        for (let message of iterator) {
            messages.push(message);
        }

        if (messages.length > 0) {
            throw messages;
        }

        return true;
    }

}

export default PathModel;