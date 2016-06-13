import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo-driver';
import mongoUtils from '../../src/mongo-utils';
import { bindOperator } from '../../src/mongo-crud-operator';

const DB_NAME = "simple-odm";

describe('mongo-crud-operator', function () {

    before(() => mongoDriver.setUp({database: DB_NAME}));
    beforeEach(mongoDriver.connect);
    beforeEach(mongoUtils.dropDatabase);
    beforeEach(mongoDriver.disconnect);

    this.timeout(5000);

    it('should insert docs.', (done) => {
        co(function* () {
            const oprator = bindOperator('users');

            const res1 = yield oprator.insertOne({
                name: "M",
                age: 34
            });

            const res2 = yield oprator.insertOne({
                name: "E",
                age: 13
            });

            expect(res1.insertedCount).to.equal(1);
            expect(res2.insertedCount).to.equal(1);

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should find docs.', (done) => {
        co(function* () {
            const oprator = bindOperator('users');

            const res1 = yield oprator.insertOne({
                name: "M",
                age: 34
            });

            const res2 = yield oprator.insertOne({
                name: "E",
                age: 13
            });

            const user1 = yield oprator.findOne({
                _id: res1.insertedId
            });

            const user2 = yield oprator.findOne({
                _id: res2.insertedId
            });

            const users = yield oprator.findMany();

            expect(user1.age).to.equal(34);
            expect(user2.age).to.equal(13);
            expect(users.length).to.equal(2);

            done();
        }).catch((e) => {
            done(e);
        });
    });

});