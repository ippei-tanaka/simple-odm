import Model from './../model';
import mongoDbModelOperator from './mongo-db-model-operator';

class MongoModel extends Model {

    /**
     * @override
     */
    static get dbOperator ()
    {
        return mongoDbModelOperator;
    }

}

export default Object.freeze(MongoModel);