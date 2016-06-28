import mongoDriver from './mongo-driver';
import mongoDbBaseOperations from './mongo-db-base-operations';
import mongoDbOperatorBuilder from './mongo-db-operator-builder';

export default mongoDbOperatorBuilder(mongoDriver, mongoDbBaseOperations);