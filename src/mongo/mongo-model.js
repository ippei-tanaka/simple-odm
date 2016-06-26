import Model from './../model';
import mongoDriver from './mongo-driver';
import mongoModelDbOperations from './mongo-model-db-operations';
import mongoDbOperatorBuilder from './mongo-db-operator-builder';
import co from 'co';
import pluralize from 'pluralize';

const operator = mongoDbOperatorBuilder(mongoDriver, mongoModelDbOperations);

class MongoModel extends Model {

    /**
     * @override
     */
    static get dbOperator ()
    {
        return operator;
    }

}

export default Object.freeze(MongoModel);