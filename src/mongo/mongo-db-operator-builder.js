import co from 'co';
import pluralize from 'pluralize';

export default (mongoDriver, originalOperations) =>
{
    const operations = {};

    for (const property of Object.keys(originalOperations))
    {
        operations[property] = (arg = {}) => co(function* ()
        {
            const db = yield mongoDriver.connect();
            arg.db = db;

            if (arg.schema) {
                const schema = arg.schema;
                const collectionName = pluralize(schema.name);
                arg.collection = db.collection(collectionName);
                delete arg.schema;
            }

            return yield originalOperations[property](arg);
        });
    }

    return operations;
};