import co from 'co';

export const createUniqueIndex = ({collection, pathName}) =>
    createIndex({collection, pathName, options: {unique: true}});

export const createIndex = ({collection, pathName, options}) =>
    collection.createIndex({[pathName]: 1}, options);

export const getIndexInfo = ({collection}) =>
    collection.indexInformation({full: true});

export const dropIndex = ({collection, pathName}) =>
    collection.dropIndex(pathName);

export const dropDatabase = ({db}) =>
    db.dropDatabase();

export const removeAllDocuments = ({db}) =>
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

export const findMany = ({collection, query = {}, sort = {}, limit = 0, skip = 0, projection = {}} = {}) =>
    collection
        .find(query, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit).toArray();

export const findOne = ({collection, query, projection = {}} = {}) =>
    collection.findOne(query, projection);

export const insertOne = ({collection, values}) =>
    collection.insertOne(values);

export const updateOne = ({collection, query, values}) =>
    collection.updateOne(query, {$set: values});

export const deleteOne = ({collection, query}) =>
    collection.deleteOne(query);

export const aggregate = ({collection, query}) =>
    new Promise((resolve, reject) =>
    {
        collection.aggregate(query, (err, result) =>
        {
            if (err) return reject(err);
            resolve(result);
        });
    });