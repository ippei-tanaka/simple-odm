import co from 'co';
import Model from './../model';
import { MongoError } from 'mongodb';
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
    static findMany ({query = {}, sort = {}, limit = 0, skip = 0} = {})
    {
        return co(function* ()
        {
            const docs = yield this.dbOperator.findMany({schema: this.schema, query, sort, limit, skip});
            return docs.map(doc => new this(doc));
        }.bind(this));
    }

    /**
     * @param query {object}
     */
    static findOne (query = {})
    {
        return co(function* ()
        {
            const doc = yield this.dbOperator.findOne({schema: this.schema, query});
            return doc ? new this(doc) : null;
        }.bind(this));
    }

    /**
     * @param query {object}
     */
    static deleteOne (query = {})
    {
        return co(function* ()
        {
            yield this.dbOperator.deleteOne({schema: this.schema, query});
        }.bind(this));
    }

    /**
     * @param query {object}
     */
    static aggregate (query)
    {
        return co(function* ()
        {
            return yield this.dbOperator.aggregate({schema: this.schema, query});
        }.bind(this));
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
    _save ({errors, values})
    {
        const dbOperator = this._dbOperator;
        const schema = this._schema;
        const id = this.id;

        return co(function* ()
        {

            // Create unique indexes if they don't exist.

            {
                let info = null;

                try
                {
                    info = yield dbOperator.getIndexInfo({schema});
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
                        yield dbOperator.createUniqueIndex({schema, pathName: path.name});
                    }
                }
            }


            // Insert or update the model based on whether it has an ID.

            const newValues = Object.assign({}, values);

            if (!id)
            {
                const { insertedId } = yield dbOperator.insertOne({
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
                yield dbOperator.updateOne({
                    schema,
                    query: createIdQuery(schema.primaryPathName, id),
                    values
                });
            }

            return {errors, values};

        }).catch(function (error)
        {
            let newError = {};

            if (error instanceof MongoError && error.code === 11000)
            {
                const match = error.message.match(/\$([\w]+)_\d+\s.+\{.+:\s"(.+)"\s\}/);
                const pathName = match[1];
                const value = match[2];
                newError = {[pathName]: [schema.paths[pathName].uniqueErrorMessageBuilder(value)]};
            }

            return {
                errors: Object.assign({}, errors, newError),
                values
            };

        }.bind(this));
    }

}

export default Object.freeze(MongoModel);