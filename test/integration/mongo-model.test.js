import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo/mongo-driver';
import mongoDbOperatorBuilder from '../../src/mongo/mongo-db-operator-builder';
import mongoBaseDbOperations from '../../src/mongo/mongo-base-db-operations';
import mongoModelDbOperations from '../../src/mongo/mongo-model-db-operations';
import MongoSchema from '../../src/mongo/mongo-schema';
import MongoModel from '../../src/mongo/mongo-model';

const DB_NAME = "simple-odm";
const dbOperator = mongoDbOperatorBuilder(mongoDriver, mongoBaseDbOperations);
const modelDbOperator = mongoDbOperatorBuilder(mongoDriver, mongoModelDbOperations);

describe('mongo-model', function ()
{
    beforeEach(() => mongoDriver.setUp({database: DB_NAME}));
    beforeEach(dbOperator.dropDatabase);

    this.timeout(10000);

    it('should save a model.', (done) =>
    {
        co(function* ()
        {

            const schema = new MongoSchema({
                name: 'user',
                paths: {
                    email: {
                        required: true
                    }
                }
            });

            class User extends MongoModel {

                static get schema ()
                {
                    return schema;
                };

                static get dbOperator ()
                {
                    return modelDbOperator;
                };
            }

            let users = yield User.findMany();

            expect(users.length).to.equal(0);

            const model = new User({
                email: "test"
            });

            yield model.save();

            users = yield User.findMany();

            expect(users.length).to.equal(1);
            expect(users[0].getValues().email).to.equal("test");

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

    it('should create a unique index when the model with the schema that has the unique flagged path is saved.', (done) =>
    {
        co(function* ()
        {

            const schema = new MongoSchema({
                name: 'user',
                paths: {
                    email: {
                        required: true,
                        unique: true
                    }
                }
            });

            class User extends MongoModel {

                static get schema ()
                {
                    return schema;
                };

                static get dbOperator ()
                {
                    return modelDbOperator;
                };

            }

            const model = new User({
                email: "test"
            });

            yield model.save();

            const info = yield modelDbOperator.getIndexInfo({schema});

            expect(info.filter(v => v.key.email === 1 && v.unique === true).length).to.equal(1);

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

});