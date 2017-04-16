import { MongoClient } from 'mongodb';
import { SimpleOdmError } from './../errors';

let db = null;

const setting = {
    port: 27017,
    host: "localhost",
    database: ""
};

const buildUrl = (obj) => `mongodb://${obj.host}:${obj.port}/${obj.database}`;

const onDisconnected = () =>
{
    db = null;
};

const connect = async () =>
    {
        if (!setting.database)
        {
            throw new SimpleOdmError("MongoDriver needs a database name to use.");
        }

        if (!db)
        {
            const url = buildUrl(setting);
            db = await MongoClient.connect(url);
            db.on("close", onDisconnected);
        }

        return db;
    };

const disconnect = async () =>
    {
        if (db)
        {
            await db.close();
        }
    };

const setUp = (args) =>
{
    if (args.hasOwnProperty('port'))
    {
        setting.port = args.port;
    }

    if (args.hasOwnProperty('host'))
    {
        setting.host = args.host;
    }

    if (args.hasOwnProperty('database'))
    {
        setting.database = args.database;
    }
};

export default Object.freeze({
    connect,
    disconnect,
    setUp
});