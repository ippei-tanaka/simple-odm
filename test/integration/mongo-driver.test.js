import { expect } from 'chai';
import MongoDriver from '../../src/mongo/mongo-driver';

const DB_NAME = "simple-odm";

describe('mongo-driver', () => {

    beforeEach(MongoDriver.disconnect);
    beforeEach(() => MongoDriver.setUp({database: ""}));

    it('should connect to MondoDB if set up is done.', async () =>
    {
        MongoDriver.setUp({database: DB_NAME});
        const db = await MongoDriver.connect();
        const stats = await db.stats();
        expect(stats).to.not.equal(null);
    });

    it('should fail to connect to MondoDB if set up is not done.', async () =>
    {
        let db = null;
        let error;

        try {
            db = await MongoDriver.connect();
        } catch (e) {
            error = e || null;
        }

        expect(error.message).to.equal("MongoDriver needs a database name to use.");
        expect(db).to.equal(null);
    });

});