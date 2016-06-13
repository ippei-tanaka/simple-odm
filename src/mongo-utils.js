import co from 'co';
import driver from './mongo-driver';

const createUniqueIndex = (collectionName, pathName) => co(function* () {
    return createIndex(collectionName, pathName, {unique: true});
});

const createIndex = (collectionName, pathName, options) => co(function* () {
    const db = yield driver.connect();
    return yield db.collection(collectionName).createIndex({[pathName]: 1}, options);
});

const getIndexInfo = (collectionName, pathName) => co(function* () {
    const db = yield driver.connect();
    return yield db.collection(collectionName).indexInformation(pathName);
});

const dropIndex = (collectionName, pathName) => co(function* () {
    const db = yield driver.connect();
    return yield db.collection(collectionName).dropIndex(pathName);
});

const dropDatabase = () => co(function* () {
    const db = yield driver.connect();
    yield db.dropDatabase();
});

export default {
    createUniqueIndex,
    createIndex,
    dropIndex,
    getIndexInfo,
    dropDatabase
};