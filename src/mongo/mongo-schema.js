import Schema from '../schema';
import Types from '../../src/types';

const idPath = {
    _id: {
        type: Types.MongoObjectID,
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