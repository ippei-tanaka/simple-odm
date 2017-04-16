const dropDatabase = ({db}) =>
    db.dropDatabase();

const getAllCollections = ({db}) =>
    db.listCollections().toArray().then(list => list.map(c => db.collection(c.name)));

const removeAllDocuments = async ({db}) =>
    {
        for (let collection of (await getAllCollections({db})))
        {
            try
            {
                await collection.deleteMany({});
            }
            catch (e)
            {}
        }
    };

export default Object.freeze({
    dropDatabase,
    removeAllDocuments
});