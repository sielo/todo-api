
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27018',
    (err, client) => {
        if (err) {
            return console.log('Unable to connect to MongoDB', err);
        }
        console.log('Connected!');
        const db = client.db('TodoApp');
        // deleteMany
        // db.collection('Todos').deleteMany({ text: 'Eat lunch' }).then((result) => {
        //     console.log(result);
        // }, (err) => {
        //    });
        // deleteOne
        // db.collection('Todos').deleteOne({ text: 'Eat lunch' }).then((result) => {
        //     console.log(result);
        // }, (err) => {});
        // findOneAndDelete
        db.collection('Todos').findOneAndDelete({ text: 'Eat lunch' }).then((result) => {
            console.log(result.value);
        }, (err) => {

        });
        //client.close();
    })