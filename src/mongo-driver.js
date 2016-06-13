import { MongoClient } from 'mongodb';
import co from 'co';

let db = null;
const SETUP_CHECK_INTERVAL = 100;

const setting = {
    port: 27017,
    host: "localhost",
    database: ""
};

const buildUrl = (obj) => `mongodb://${obj.host}:${obj.port}/${obj.database}`;

const onDisconnected = () => {
    db = null;
};

const wait = (msec) => new Promise((resolve) => {
    setTimeout(resolve, msec);
});

const connect = ({waitForSetup = 3000} = {}) => {

    let attempt = 0;
    const attemptLimit = Math.floor(waitForSetup / SETUP_CHECK_INTERVAL);

    return co(function* () {

        while (!setting.database && attempt < attemptLimit) {
            attempt += 1;
            yield wait(SETUP_CHECK_INTERVAL);
        }

        if (!setting.database) {
            throw new Error("The driver needs a database name to use.");
        }

        if (!db) {
            const url = buildUrl(setting);
            db = yield MongoClient.connect(url);
            db.on("close", onDisconnected);
        }

        return db;

    });
};

const disconnect = () => co(function* () {
    if (db) {
        yield db.close();
    }
});

const setUp = (args) => {
    if (args.hasOwnProperty('port')) {
        setting.port = args.port;
    }

    if (args.hasOwnProperty('host')) {
        setting.host = args.host;
    }

    if (args.hasOwnProperty('database')) {
        setting.database = args.database;
    }
};

export default {connect, disconnect, setUp};