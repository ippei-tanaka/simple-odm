import co from 'co';
import { expect } from 'chai';
import driver from '../../src/mongo-driver';

const DB_NAME = "simple-odm";

describe('mongo-driver', function () {

    driver.setUp({database: DB_NAME});

    it('should connect to MondoDB', (done) => {
        co(function* () {
            const db = yield driver.connect();
            const stats = yield db.stats();
            expect(stats).to.not.equal(null);
            yield db.close();
            done();
        }).catch((e) => {
            done(e);
        });
    });

});