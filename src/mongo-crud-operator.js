import co from 'co';
import driver from './mongo-driver';

const getCollection = (collectionName) => co(function* () {
    const db = yield driver.connect();
    return db.collection(collectionName);
});

const findMany = (collectionName, {
    query = {},
    sort = {},
    limit = 0,
    skip = 0,
    projection = {}
    } = {})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield collection
            .find(query, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit).toArray();
    });

const findOne = (collectionName, {
    query = {},
    projection = {}
    } = {})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield collection.findOne(query, projection);
    });

const insertOne = (collectionName, {values})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield collection.insertOne(values);
    });

const updateOne = (collectionName, {query, values})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield collection.updateOne(
            query,
            {$set: values}
        );
    });

const deleteOne = (collectionName, {query})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield collection.deleteOne(query);
    });

const aggregate = (collectionName, {query})
    =>
    co(function* () {
        const collection = yield getCollection(collectionName);
        return yield new Promise((resolve, reject) => {
            collection.aggregate(query, function (err, result) {
                if (err) return reject(err);
                resolve(result);
            });
        });
    });

const operator = {
    findMany, findOne,
    insertOne, updateOne, deleteOne,
    aggregate
};

export const bindOperator = (collectionName) => {
    const obj = {};

    for (let key of Object.keys(operator)) {
        obj[key] = operator[key].bind(null, collectionName);
    }

    return obj;
};

export default operator;