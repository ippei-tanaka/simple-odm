import Model from './../model';
import {MongoError} from 'mongodb';
import mongoDbModelOperator from './mongo-db-model-operator';

const createIdQuery = (key, id) => id ? {[key]: id} : null;

class MongoModel extends Model {

    /**
     * @override
     */
    constructor (...args)
    {
        super(...args);
        this._dbOperator = this.constructor.dbOperator;
        Object.freeze(this);
    }

    /**
     * @param query {object}
     * @param sort {object}
     * @param limit {number}
     * @param skip {number}
     */
    static async findMany ({query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        const docs = await this.dbOperator.findMany({schema: this.schema, query, sort, limit, skip});
        return docs.map(doc => new this(doc));
    }

    /**
     * @param query {object}
     */
    static async findOne (query = {})
    {
        const doc = await this.dbOperator.findOne({schema: this.schema, query});
        return doc ? new this(doc) : null;
    }

    /**
     * @param query {object}
     */
    static async deleteOne (query = {})
    {
        await this.dbOperator.deleteOne({schema: this.schema, query});
    }

    /**
     * @param query {object}
     */
    static async aggregate (query)
    {
        return await this.dbOperator.aggregate({schema: this.schema, query});
    }

    /**
     * @override
     */
    static get dbOperator ()
    {
        return mongoDbModelOperator;
    }

    /**
     * @override
     */
    async _save ({errors, values})
    {
        const dbOperator = this._dbOperator;
        const schema = this._schema;
        const id = this.id;

        {
            let info = null;

            try
            {
                info = await dbOperator.getIndexInfo({schema});
            }
            catch (e)
            {}

            for (let path of schema)
            {
                if (!path.isUnique)
                {
                    continue;
                }

                const hasUniqueIndex = info === null
                    ? false
                    : info.filter(v => v.key[path.name] === 1 && v.unique === true).length > 0;

                if (!hasUniqueIndex)
                {
                    await dbOperator.createUniqueIndex({schema, pathName: path.name});
                }
            }
        }


        try
        {

            const newValues = Object.assign({}, values);

            if (!id)
            {
                const {insertedId} = await dbOperator.insertOne({
                    schema,
                    values
                });

                if (schema.primaryPathName)
                {
                    newValues[schema.primaryPathName] = insertedId;
                }
            }
            else
            {
                // Delete primaryPathName temporarily because if it is "_id" MongoDB doesn't allow it to be updated.
                delete values[schema.primaryPathName];

                await dbOperator.updateOne({
                    schema,
                    query: createIdQuery(schema.primaryPathName, id),
                    values
                });

                values[schema.primaryPathName] = id;
            }
            return {errors, values};

        }
        catch (e)
        {
            let newError = {};

            if (e instanceof MongoError && e.code === 11000)
            {
                const match = e.message.match(/([\w]+)_\d+\s.+\{.+:\s"(.+)"\s\}/);
                const pathName = match[1];
                const value = match[2];
                newError = {[pathName]: [schema.paths[pathName].uniqueErrorMessageBuilder(value)]};
            }

            return {
                errors: Object.assign({}, errors, newError),
                values
            };
        }
    }

}

export default Object.freeze(MongoModel);