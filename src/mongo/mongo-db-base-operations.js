import co from 'co';

const dropDatabase = ({db}) =>
    db.dropDatabase();

const getAllCollections = ({db}) =>
    db.listCollections().toArray().then(list => list.map(c => db.collection(c.name)));

const removeAllDocuments = ({db}) =>
    co(function* ()
    {
        for (let collection of (yield getAllCollections({db})))
        {
            try
            {
                yield collection.deleteMany({});
            }
            catch (e)
            {}
        }
    });

export default Object.freeze({
    dropDatabase,
    removeAllDocuments
});