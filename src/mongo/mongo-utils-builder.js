import co from 'co';
import MongoUtils from './mongo-utils'

class MongoUtilsBuilder
{
    static build (driver)
    {
        const obj = {};

        for (let key of Object.getOwnPropertyNames(MongoUtils))
        {
            if (typeof MongoUtils[key] === "function")
            {
                obj[key] = MongoUtils[key].bind(MongoUtils, driver);
            }
        }

        return Object.freeze(obj);
    }
}

export default Object.freeze(MongoUtilsBuilder);
