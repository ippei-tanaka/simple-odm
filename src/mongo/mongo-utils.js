import co from 'co';

class MongoUtils {

    static createUniqueIndex (driver, collectionName, pathName)
    {
        return this.createIndex(driver, collectionName, pathName, {unique: true});
    }

    static createIndex (driver, collectionName, pathName, options)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            return yield db.collection(collectionName)
                           .createIndex({[pathName]: 1}, options);
        });
    }

    static getIndexInfo (driver, collectionName)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            return yield db.collection(collectionName).indexInformation({full: true});
        });
    }

    static dropIndex (driver, collectionName, pathName)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            return yield db.collection(collectionName).dropIndex(pathName);
        });
    }

    static dropDatabase (driver)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            yield db.dropDatabase();
        });
    }

    static removeAllDocuments (driver)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            const collections = yield db.listCollections().toArray();

            for (let c of collections)
            {
                const collection = db.collection(c.name);
                try
                {
                    yield collection.deleteMany({});
                } catch (e)
                {}
            }
        });
    }

}

export default Object.freeze(MongoUtils);