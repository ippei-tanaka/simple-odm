import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo/mongo-driver';
import MongoUtils from '../../src/mongo/mongo-utils';
import MongoCrudOperator from '../../src/mongo/mongo-crud-operator';

const DB_NAME = "simple-odm";

describe('mongo-crud-operator', function ()
{

    before(() => MongoDriver.setUp({database: DB_NAME}));
    before(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(() => MongoUtils.removeAllDocuments(MongoDriver));

    this.timeout(10000);

    it('should insert docs.', (done) =>
    {
        co(function* ()
        {
            const res1 = yield MongoCrudOperator.insertOne(
                MongoDriver,
                'persons',
                {
                    name: "M",
                    age: 34
                });

            const res2 = yield MongoCrudOperator.insertOne(
                MongoDriver,
                'persons',
                {
                    name: "E",
                    age: 13
                });

            expect(res1.insertedCount).to.equal(1);
            expect(res2.insertedCount).to.equal(1);

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

    it('should find docs.', (done) =>
    {
        co(function* ()
        {
            const res1 = yield MongoCrudOperator.insertOne(
                MongoDriver,
                'persons',
                {
                    name: "M",
                    age: 34
                });

            const res2 = yield MongoCrudOperator.insertOne(
                MongoDriver,
                'persons',
                {
                    name: "E",
                    age: 13
                });

            const user1 = yield MongoCrudOperator.findOne(
                MongoDriver,
                'persons',
                {
                    _id: res1.insertedId
                });

            const user2 = yield MongoCrudOperator.findOne(
                MongoDriver,
                'persons',
                {
                    _id: res2.insertedId
                });

            const users = yield MongoCrudOperator.findMany(MongoDriver, 'persons');

            expect(user1.age).to.equal(34);
            expect(user2.age).to.equal(13);
            expect(users.length).to.equal(2);

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

});