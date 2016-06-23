import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo-driver';
import MongoUtils from '../../src/mongo-utils';
import MongoCrudOperatorBuilder from '../../src/mongo-crud-operator-builder';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import ModelBuilder from '../../src/model-builder';

const DB_NAME = "simple-odm";

describe('mongo', function () {

    before(() => MongoDriver.setUp({database: DB_NAME}));
    beforeEach(MongoDriver.connect);
    beforeEach(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(MongoDriver.disconnect);

    this.timeout(10000);

    it('should create a unique index when the model with the schema that has the unique flagged path is saved.', (done) => {
        co(function* () {

            const schema = new Schema({
                name: 'user',
                paths: {
                    email: {
                        required: true
                    }
                }
            });

            const User = ModelBuilder.build(schema);

            const model = new User({
                email: "test"
            });

            const operator = MongoCrudOperatorBuilder.build(MongoDriver, 'users');
            const res1 = yield MongoUtils.createUniqueIndex(MongoDriver, 'users', 'email');
            const res2 = yield MongoUtils.createUniqueIndex(MongoDriver, 'users', 'email');
            const info = yield MongoUtils.getIndexInfo(MongoDriver, 'users', 'email');
            expect(res1).to.equal('email_1');
            expect(res2).to.equal('email_1');
            expect(info).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

});