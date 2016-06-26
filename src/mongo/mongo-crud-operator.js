import co from 'co';

const connectToCollection = function (driver, collectionName)
{
    return co(function* ()
    {
        const db = yield driver.connect();
        return db.collection(collectionName);
    });
};

class MongoCrudOperator {

    static findMany (
        driver,
        collectionName,
        query = {},
        sort = {},
        limit = 0,
        skip = 0,
        projection = {}
    )
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield collection
                .find(query, projection)
                .sort(sort)
                .skip(skip)
                .limit(limit).toArray();
        })
    }

    static findOne (driver, collectionName, query, projection = {})
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield collection.findOne(query, projection);
        })
    }

    static insertOne (driver, collectionName, values)
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield collection.insertOne(values);
        })
    }

    static updateOne (driver, collectionName, query, values)
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield collection.updateOne(
                query,
                {$set: values}
            );
        })
    }

    static deleteOne (driver, collectionName, query)
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield collection.deleteOne(query);
        })
    }

    static aggregate (driver, collectionName, query)
    {
        const connect = connectToCollection.bind(null, driver, collectionName);

        return co(function* ()
        {
            const collection = yield connect();
            return yield new Promise((resolve, reject) =>
            {
                collection.aggregate(query, (err, result) =>
                {
                    if (err) return reject(err);
                    resolve(result);
                });
            })
        });
    }
}

export default Object.freeze(MongoCrudOperator);