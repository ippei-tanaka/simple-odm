import mongoDriver from './mongo-driver';
import mongoDbModelOperations from './mongo-db-model-operations';
import mongoDbOperatorBuilder from './mongo-db-operator-builder';

export default mongoDbOperatorBuilder(mongoDriver, mongoDbModelOperations);