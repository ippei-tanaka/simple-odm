import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo/mongo-driver';
import MongoUtils from '../../src/mongo/mongo-utils';
import MongoSchema from '../../src/mongo/mongo-schema';
import MongoModel from '../../src/mongo/mongo-model';

const DB_NAME = "simple-odm";

describe('mongo-model', function ()
{

    before(() => MongoDriver.setUp({database: DB_NAME}));
    beforeEach(MongoDriver.connect);
    beforeEach(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(MongoDriver.disconnect);

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

            }

            const model = new User({
                email: "test"
            });

            yield model.save();

            const info = yield MongoUtils.getIndexInfo(MongoDriver, "users");

            expect(info.filter(v => v.key.email === 1 && v.unique === true).length).to.equal(1);

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

});