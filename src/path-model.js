import { TYPES, convertTo, isValidType } from './type';
import { SimpleOdmError } from './errors';
import Path from './path';

const checkIfEmpty = (value) => value === "" || value === undefined;

const normalize = (value, type) => {
    try {
        if (value === undefined || value === null) {
            return value;
        }
        return convertTo(value, type);
    } catch (error) {
        return undefined;
    }
};

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

        const _normalizedValue = normalize(value, path.type);
        this._normalizedValue = _normalizedValue !== undefined
            ? _normalizedValue
            : path.defaultValue;

        this._projectedValue = path.isProjected ? this._normalizedValue : undefined;

        Object.freeze(this._rowValue);
        Object.freeze(this._normalizedValue);
        Object.freeze(this._projectedValue);
        Object.freeze(this);
    }

    /**
     * @returns {Path}
     */
    get path () {
        return this._path;
    }

    get rowValue() {
        return this._rowValue;
    }

    get normalizedValue() {
        return this._normalizedValue;
    }

    get projectedValue () {
        return this._projectedValue;
    }

    *examine({updated = false} = {}) {

        const rowValue = this._rowValue;
        const isEmpty = checkIfEmpty(rowValue);
        const path = this._path;

        if (isEmpty && !updated && path.isRequiredWhenCreated) {
            return yield path.requiredWhenCreatedErrorMessageBuilder();
        }

        if (isEmpty && updated && path.isRequiredWhenUpdated) {
            return yield path.requiredWhenUpdatedErrorMessageBuilder();
        }

        if (isEmpty) {
            return;
        }

        try {
            convertTo(rowValue, path.type);
        } catch (error) {
            return yield path.typeErrorMessageBuilder(rowValue);
        }

        const iterator = path.validator(path.sanitizer(rowValue));

        for (let message of iterator) {
            yield message;
        }

    }

}

export default PathModel;