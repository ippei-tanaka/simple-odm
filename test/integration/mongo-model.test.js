import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo-driver';
import MongoUtils from '../../src/mongo-utils';
import MongoCrudOperator from '../../src/mongo-crud-operator';
import { Types } from '../../src/type';
import MongoSchema from '../../src/mongo-schema';
import ModelBuilder from '../../src/model-builder';

const DB_NAME = "simple-odm";

describe('mongo-model', function () {

    before(() => MongoDriver.setUp({database: DB_NAME}));
    beforeEach(MongoDriver.connect);
    beforeEach(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(MongoDriver.disconnect);

    this.timeout(10000);

    it('should create a unique index when the model with the schema that has the unique flagged path is saved.', (done) => {
        co(function* () {

            const schema = new MongoSchema({
                name: 'user',
                paths: {
                    email: {
                        required: true
                    }
                }
            });

            const User = ModelBuilder.build({
                driver: MongoDriver,
                operator: MongoCrudOperator,
                schema
            });

            const model = new User({
                email: "test"
            });

            yield model.save();

            const users = yield User.findMany();

            expect(users.length).to.equal(1);
            expect(users[0].getValues().email).to.equal("test");

            done();
        }).catch((e) => {
            done(e);
        });
    });

});