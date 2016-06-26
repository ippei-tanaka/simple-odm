import Model from './../model';
import MongoUtils from './mongo-utils';
import MongoDriver from './mongo-driver';
import MongoCrudOperator from './mongo-crud-operator';

class MongoModel extends Model {

    /**
     * @override
     */
    static get operator ()
    {
        return MongoCrudOperator;
    };

    /**
     * @override
     */
    static get driver ()
    {
        return MongoDriver;
    }

    /**
     * @override
     */
    static get utils ()
    {
        return MongoUtils;
    };

}

export default Object.freeze(MongoModel);