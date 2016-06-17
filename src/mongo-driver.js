import { MongoClient } from 'mongodb';
import Driver from './driver';
import co from 'co';
import { SimpleOdmError } from './errors';

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

class MongoDriver extends Driver {

    static connect ()
    {
        return co(function* ()
        {
            if (!setting.database)
            {
                throw new SimpleOdmError("MongoDriver needs a database name to use.");
            }

            if (!db)
            {
                const url = buildUrl(setting);
                db = yield MongoClient.connect(url);
                db.on("close", onDisconnected);
            }

            return db;
        });
    }

    static  disconnect ()
    {
        return co(function* ()
        {
            if (db)
            {
                yield db.close();
            }
        });
    }

    static setUp (args)
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
    }
}

Object.freeze(MongoDriver);

export default MongoDriver;