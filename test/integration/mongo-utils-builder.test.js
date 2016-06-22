import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo-driver';
import MongoUtils from '../../src/mongo-utils';
import MongoUtilsBuilder from '../../src/mongo-utils-builder';

const DB_NAME = "simple-odm";

describe('mongo-utils-builder', function () {

    before(() => MongoDriver.setUp({database: DB_NAME}));
    beforeEach(MongoDriver.connect);
    beforeEach(() => MongoUtils.dropDatabase(MongoDriver));
    beforeEach(MongoDriver.disconnect);

    this.timeout(10000);

    it('should create a unique index.', (done) => {
        co(function* () {
            const utils = MongoUtilsBuilder.build(MongoDriver);
            const res1 = yield utils.createUniqueIndex('users', 'password');
            const res2 = yield utils.createUniqueIndex('users', 'password');
            const info = yield utils.getIndexInfo('users', 'password');
            expect(res1).to.equal('password_1');
            expect(res2).to.equal('password_1');
            expect(info).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

});