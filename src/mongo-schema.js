import Schema from './schema';
import { Types } from './type';

const idPath = {
    _id: {
        type: Types.MongoObjectID,
        required: true
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
        super({name, thisPaths});
    }

    get primaryPathName ()
    {
        return '_id';
    }
}

export default Object.freeze(Schema);