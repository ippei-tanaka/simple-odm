import MongoCrudOperator from './mongo-crud-operator';

class MongoCrudOperatorBuilder
{
    static build (driver, collectionName)
    {
        const obj = {};

        for (let key of Object.getOwnPropertyNames(MongoCrudOperator))
        {
            if (typeof MongoCrudOperator[key] === "function")
            {
                obj[key] = MongoCrudOperator[key].bind(MongoCrudOperator, driver, collectionName);
            }
        }

        return Object.freeze(obj);
    }
}

export default Object.freeze(MongoCrudOperatorBuilder);