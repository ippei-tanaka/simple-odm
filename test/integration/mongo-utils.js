import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo-driver';
import mongoUtils from '../../src/mongo-utils';

const DB_NAME = "simple-odm";

describe('mongo-driver', function () {

    beforeEach(mongoDriver.disconnect);
    beforeEach(() => mongoDriver.setUp({database: ""}));

    this.timeout(5000);

    it('should createU if set up is done.', (done) => {
        co(function* () {
            mongoDriver.setUp({database: DB_NAME});
            const db = yield mongoDriver.connect();
            const stats = yield db.stats();
            expect(stats).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

});