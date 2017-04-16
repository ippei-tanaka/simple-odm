const createUniqueIndex = ({collection, pathName}) =>
    collection.createIndex({[pathName]: 1}, {unique: true});

const getIndexInfo = ({collection}) =>
    collection.indexInformation({full: true});

const findMany = ({collection, query = {}, sort = {}, limit = 0, skip = 0, projection = {}} = {}) =>
    collection
        .find(query, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit).toArray();

const findOne = ({collection, query, projection = {}} = {}) =>
    collection.findOne(query, projection);

const insertOne = ({collection, values}) =>
    collection.insertOne(values);

const updateOne = ({collection, query, values}) =>
    collection.updateOne(query, {$set: values});

const deleteOne = ({collection, query}) =>
    collection.deleteOne(query);

const aggregate = ({collection, query}) =>
    new Promise((resolve, reject) =>
    {
        collection.aggregate(query, (err, result) =>
        {
            if (err) return reject(err);
            resolve(result);
        });
    });

export default Object.freeze({
    createUniqueIndex,
    getIndexInfo,
    findMany,
    findOne,
    insertOne,
    updateOne,
    deleteOne,
    aggregate
});