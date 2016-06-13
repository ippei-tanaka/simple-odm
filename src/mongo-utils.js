import co from 'co';
import driver from './mongo-driver';

const createUniqueIndex = (collectionName, pathName) => co(function* () {
    const db = yield driver.connect();
    yield db.collection(collectionName).createIndex({[pathName]: 1}, {unique: true});
});

const dropIndex = (collectionName, pathName) => co(function* () {
    const db = yield driver.connect();
    yield db.collection(collectionName).dropIndex(pathName);
});

const removeAllDocuments = () => co(function* () {
    const db = yield driver.connect();
    const collections = yield db.listCollections().toArray();

    for (let c of collections) {
        const collection = db.collection(c.name);
        try {
            yield collection.deleteMany({});
        } catch (e) {
            throw e;
        }
    }
});

const dropDatabase = () => co(function* () {
    const db = yield driver.connect();
    yield db.dropDatabase();
});

export default { createUniqueIndex, dropIndex, removeAllDocuments, dropDatabase };