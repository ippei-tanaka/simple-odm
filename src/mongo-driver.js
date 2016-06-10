import { MongoClient } from 'mongodb';
import co from 'co';

let db = null;

const setting = {
    port: 27017,
    host: "localhost",
    database: ""
};

const connect = ({port, host, database} = {}) => {
    if (!setting.database && !database)
        throw new Error("The driver needs a database name to use.");

    return co(function* () {
        if (!db) {
            const url = buildUrl({
                port: port || setting.port,
                host: host || setting.host,
                database: database || setting.database
            });
            db = yield MongoClient.connect(url);
            db.on("close", onDisconnected);
        }
        return db;
    }).catch((error) => {
        console.error(error.stack);
        return null;
    });
};

const setUp = ({port, host, database} = {}) => {
    setting.port = port || setting.port;
    setting.host = host || setting.host;
    setting.database = database || setting.database;
};

const buildUrl = (obj) => `mongodb://${obj.host}:${obj.port}/${obj.database}`;

const onDisconnected = () => {
    db = null;
};

export default {connect, setUp};