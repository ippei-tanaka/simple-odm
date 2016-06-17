import co from 'co';
import DbUtils from './db-utils';

class MongoUtils extends DbUtils {

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

    static getIndexInfo (driver, collectionName, pathName)
    {
        return co(function* ()
        {
            const db = yield driver.connect();
            return yield db.collection(collectionName).indexInformation(pathName);
        });
    }

    static  dropIndex (driver, collectionName, pathName)
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

}

Object.freeze(MongoUtils);

export default MongoUtils;