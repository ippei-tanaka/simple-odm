import pluralize from 'pluralize';

export default (mongoDriver, originalOperations) =>
{
    const operations = {};

    for (const property of Object.keys(originalOperations))
    {
        operations[property] = async (arg = {}) =>
        {
            const db = await mongoDriver.connect();
            arg.db = db;

            if (arg.schema) {
                const schema = arg.schema;
                const collectionName = pluralize(schema.name);
                arg.collection = db.collection(collectionName);
                delete arg.schema;
            }

            return await originalOperations[property](arg);
        };
    }

    return Object.freeze(operations);
};