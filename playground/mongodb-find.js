
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27018',
    (err, client) => {
        if (err) {
            return console.log('Unable to connect to MongoDB', err);
        }
        console.log('Connected!');
        const db = client.db('TodoApp');
        // wyszukiwanie typu "LIKE"
        db.collection('Todos').find({text:/Cos/}).toArray().then((docs) => {
            console.log(JSON.stringify(docs, null, 2));
        }, (err) => {
            console.log('Unable to get docs!');
        });
        // wyszukiwanie pod _id
        db.collection('Todos').find({_id:new ObjectID('5a2bfac90fab9d08dc866ed7')}).toArray().then((docs) => {
            console.log(JSON.stringify(docs, null, 2));
        }, (err) => {
            console.log('Unable to get docs!');
        });

        db.collection('Todos').find().count().then((count) =>{
            console.log(`Liczba Todos: ${count}`);
        }, (err)=>{
            console.log('Unable to fetch Todos');
        });

        client.close();
    })