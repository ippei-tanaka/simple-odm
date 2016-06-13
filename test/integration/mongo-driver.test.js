import co from 'co';
import { expect } from 'chai';
import mongoDriver from '../../src/mongo-driver';

const DB_NAME = "simple-odm";

describe('mongo-driver', function () {

    beforeEach(mongoDriver.disconnect);
    beforeEach(() => mongoDriver.setUp({database: ""}));

    this.timeout(5000);

    it('should connect to MondoDB if set up is done.', (done) => {
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

    it('should connect to MondoDB even if set up is delayed a little bit.', (done) => {
        setTimeout(() => {
            mongoDriver.setUp({database: DB_NAME});
        }, 300);

        co(function* () {
            const db = yield mongoDriver.connect();
            const stats = yield db.stats();
            expect(stats).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should connect to MondoDB even if set up is delayed too much.', (done) => {

        setTimeout(() => {
            mongoDriver.setUp({database: DB_NAME});
        }, 2000);

        let db = null;

        mongoDriver.connect({waitForSetup: 1000}).then(_db => {
            db = _db;
        }).catch(error => {
            expect(error.message).to.equal("The driver needs a database name to use.");
            expect(db).to.equal(null);
            done();
        });

    });

});