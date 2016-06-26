import co from 'co';

export const createUniqueIndex = (db, collectionName, pathName) =>
    createIndex(db, collectionName, pathName, {unique: true});

export const createIndex = (db, collectionName, pathName, options) =>
    db.collection(collectionName).createIndex({[pathName]: 1}, options);

export const getIndexInfo = (db, collectionName) =>
    db.collection(collectionName).indexInformation({full: true});

export const dropIndex = (db, collectionName, pathName) =>
    db.collection(collectionName).dropIndex(pathName);

export const dropDatabase = (db) =>
    db.dropDatabase();

export const removeAllDocuments = (db) =>
{
    return co(function* ()
    {
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
};

