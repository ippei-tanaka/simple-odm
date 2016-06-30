import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo/mongo-driver';
import mongoDbBaseOperator from '../../src/mongo/mongo-db-base-operator';
import mongoDbModelOperator from '../../src/mongo/mongo-db-model-operator';
import MongoSchema from '../../src/mongo/mongo-schema';
import MongoModel from '../../src/mongo/mongo-model';
import types from '../../src/types';

const DB_NAME = "simple-odm";

describe('mongo-model', function ()
{
    beforeEach(() => mongoDriver.setUp({database: DB_NAME}));
    beforeEach(mongoDbBaseOperator.dropDatabase);

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
            expect(users[0].values.email).to.equal("test");

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

    it('should update a model.', (done) =>
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

            const model = new User({
                email: "test"
            });

            expect(model.id).to.be.an("undefined");
            expect(model.values._id).to.be.an("undefined");

            yield model.save();

            const users = yield User.findMany();

            expect(model.id).not.to.be.an("undefined");
            expect(model.values._id).not.to.be.an("undefined");
            expect(model.id).to.equal(model.values._id);
            expect(users[0].id).to.equal(users[0].values._id);
            expect(users[0].id.toString()).to.equal(model.id.toString());
            expect(users[0].values.email).to.equal("test");

            expect(users.length).to.equal(1);

            users[0].values.email = "Lovely";
            yield users[0].save();

            const users2 = yield User.findMany();

            expect(users[0].id).to.equal(users[0].values._id);
            expect(users[0].id.toString()).to.equal(model.id.toString());
            expect(users[0].values.email).to.equal("Lovely");

            expect(users2.length).to.equal(1);
            expect(users2[0].values.email).to.equal("Lovely");
            expect(users2[0].id).to.equal(users2[0].values._id);
            expect(users2[0].id.toString()).to.equal(users[0].id.toString());
            expect(users2[0].id.toString()).to.equal(model.id.toString());

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

            const info = yield mongoDbModelOperator.getIndexInfo({schema});

            expect(info.filter(v => v.key.email === 1 && v.unique === true).length).to.equal(1);


            let error;

            const model2 = new User({
                email: "test"
            });

            try
            {
                yield model2.save();
            } catch (e)
            {
                error = e || null;
            }

            expect(error.email[0]).to.equal('The email, "test", has already been taken.');

            done();

        }).catch((e) =>
        {
            done(e);
        });
    });

});