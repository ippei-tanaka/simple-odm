import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo-driver';
import MongoUtils from '../../src/mongo-utils';
import MongoUtilsBuilder from '../../src/mongo-utils-builder';

const DB_NAME = "simple-odm";

describe('mongo-utils', function () {

    before(() => MongoDriver.setUp({database: DB_NAME}));
    beforeEach(MongoDriver.connect);
    beforeEach(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(MongoDriver.disconnect);

    this.timeout(10000);

    it('should create a unique index.', (done) => {
        co(function* () {
            const res1 = yield MongoUtils.createUniqueIndex(MongoDriver, 'users', 'email');
            const res2 = yield MongoUtils.createUniqueIndex(MongoDriver, 'users', 'email');
            const info = yield MongoUtils.getIndexInfo(MongoDriver, 'users');
            expect(res1).to.equal('email_1');
            expect(res2).to.equal('email_1');
            expect(info).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

});