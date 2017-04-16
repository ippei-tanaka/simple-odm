import { expect } from 'chai';
import mongoDriver from '../../src/mongo/mongo-driver';
import mongoDbBaseOperator from '../../src/mongo/mongo-db-base-operator';
import mongoDbModelOperator from '../../src/mongo/mongo-db-model-operator';
import MongoSchema from '../../src/mongo/mongo-schema';
import MongoModel from '../../src/mongo/mongo-model';
import { ObjectID } from 'mongodb';

const DB_NAME = "simple-odm";

describe('mongo-model', function ()
{
    beforeEach(() => mongoDriver.setUp({database: DB_NAME}));
    beforeEach(mongoDbBaseOperator.dropDatabase);

    this.timeout(10000);

    it('should save a model.', async () =>
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

        let users = await User.findMany();

        expect(users.length).to.equal(0);

        const model = new User({
            email: "test"
        });

        await model.save();

        users = await User.findMany();

        expect(users.length).to.equal(1);
        expect(users[0].values.email).to.equal("test");
    });

    it('should update a model.', async () =>
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

        await model.save();

        const users = await User.findMany();

        expect(model.id).not.to.be.an("undefined");
        expect(model.values._id).not.to.be.an("undefined");
        expect(model.id).to.equal(model.values._id);
        expect(users[0].id).to.equal(users[0].values._id);
        expect(users[0].id.toString()).to.equal(model.id.toString());
        expect(users[0].values.email).to.equal("test");

        expect(users.length).to.equal(1);

        users[0].values.email = "Lovely";
        await users[0].save();

        const users2 = await User.findMany();

        expect(users[0].id).to.equal(users[0].values._id);
        expect(users[0].id.toString()).to.equal(model.id.toString());
        expect(users[0].values.email).to.equal("Lovely");

        expect(users2.length).to.equal(1);
        expect(users2[0].values.email).to.equal("Lovely");
        expect(users2[0].id).to.equal(users2[0].values._id);
        expect(users2[0].id.toString()).to.equal(users[0].id.toString());
        expect(users2[0].id.toString()).to.equal(model.id.toString());
    });

    it('should delete a model.', async () =>
    {
        const schema = new MongoSchema({
            name: 'user',
            paths: {
                email: {}
            }
        });

        class User extends MongoModel {

            static get schema ()
            {
                return schema;
            };
        }

        const users1 = await User.findMany();

        expect(users1.length).to.equal(0);

        const model = new User({
            email: "test"
        });

        expect(model.id).to.be.an("undefined");
        expect(model.values._id).to.be.an("undefined");

        await model.save();

        const users2 = await User.findMany();

        expect(users2.length).to.equal(1);

        await User.deleteOne({_id: new ObjectID(users2[0].id)});

        const users3 = await User.findMany();

        expect(users3.length).to.equal(0);
    });

    it('should not create a new document with a duplicated value that is supposed to be unique.', async () =>
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

        await model.save();

        const info = await mongoDbModelOperator.getIndexInfo({schema});

        expect(info.filter(v => v.key.email === 1 && v.unique === true).length).to.equal(1);


        let error;

        const model2 = new User({
            email: "test"
        });

        try
        {
            await model2.save();
        }
        catch (e)
        {
            error = e || null;
        }

        expect(error.message.email[0]).to.equal('The email, "test", has already been taken.');
    });

    it('should not update a new document with a duplicated value that is supposed to be unique.', async () =>
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

        await model.save();

        const model2 = new User({
            email: "test1"
        });

        await model2.save();

        const user = await User.findOne({_id: model2.id});

        let error;

        try
        {
            user.values.email = "test";
            await user.save();
        }
        catch (e)
        {
            error = e || null;
        }

        expect(error.message.email[0]).to.equal('The email, "test", has already been taken.');
    });

});