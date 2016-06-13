import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo-driver';
import mongoUtils from '../../src/mongo-utils';

const DB_NAME = "simple-odm";

describe('mongo-utils', function () {

    before(() => mongoDriver.setUp({database: DB_NAME}));
    beforeEach(mongoDriver.connect);
    beforeEach(mongoUtils.dropDatabase);
    beforeEach(mongoDriver.disconnect);

    this.timeout(5000);

    it('should create a unique index.', (done) => {
        co(function* () {
            const res1 = yield mongoUtils.createUniqueIndex('users', 'email');
            const res2 = yield mongoUtils.createUniqueIndex('users', 'email');
            const info = yield mongoUtils.getIndexInfo('users', 'email');
            expect(res1).to.equal('email_1');
            expect(res2).to.equal('email_1');
            expect(info).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

});