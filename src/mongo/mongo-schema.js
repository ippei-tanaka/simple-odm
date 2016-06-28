import Schema from '../schema';
import types from '../types';

const idPath = {
    _id: {
        type: types.MongoObjectID,
        required: ['updated']
    }
};

class MongoSchema extends Schema {

    /**
     * @param name {string}
     * @param paths {object}
     */
    constructor ({name, paths = {}})
    {
        const thisPaths = Object.assign({}, paths, idPath);
        super({name, paths: thisPaths});
    }

    get primaryPathName ()
    {
        return '_id';
    }
}

export default Object.freeze(MongoSchema);