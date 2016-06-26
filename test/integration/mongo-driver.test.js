import co from 'co';
import { expect } from 'chai';
import MongoDriver from '../../src/mongo/mongo-driver';

const DB_NAME = "simple-odm";

describe('mongo-driver', function () {

    beforeEach(MongoDriver.disconnect);
    beforeEach(() => MongoDriver.setUp({database: ""}));

    it('should connect to MondoDB if set up is done.', (done) => {
        co(function* () {
            MongoDriver.setUp({database: DB_NAME});
            const db = yield MongoDriver.connect();
            const stats = yield db.stats();
            expect(stats).to.not.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });
    });


    it('should fail to connect to MondoDB if set up is not done.', (done) => {

        let db = null;
        let error;

        co(function* () {
            try {
                db = yield MongoDriver.connect();
            } catch (e) {
                error = e || null;
            }
            expect(error.message).to.equal("MongoDriver needs a database name to use.");
            expect(db).to.equal(null);
            done();
        }).catch((e) => {
            done(e);
        });

    });

});