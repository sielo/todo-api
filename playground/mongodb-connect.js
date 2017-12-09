
//const MongoClient = require('mongodb').MongoClient;
//const ObjectID = require('mongodb').ObjectID;
// przykład destrukturyzacji właściwości obiektów na zmienną.
const {MongoClient, ObjectID} = require('mongodb');

// generuje to samo o jest w "_id" w MongoDB
//var obj = new ObjectID();
//console.log(obj);

MongoClient.connect('mongodb://127.0.0.1:27018',
    (err, client) => {
        if (err) {
            return console.log('Unable to connect to MongoDB', err);
        }
        console.log('Connected!', client);
        const db = client.db('TodoApp');
        // db.collection('Todos').insertOne({
        //     text: 'Cos do zrobienia',
        //     completed: false
        // }, (err, result) => {
        //     if (err) {
        //         return console.log('Unable to insert Todos', err);
        //     }
        //     console.log(JSON.stringify(result.ops, null, 2));
        // });
        // -----------------------------
        // db.collection('Users').insertOne({
        //     name: 'Michał zażółć gęślą jaźń ZAŻÓŁĆ GĘŚLĄ JAŹŃ',
        //     age: 25,
        //     loaction: 'Głosków'
        // }, (err, result) => {
        //     if (err) {
        //         return console.log('Unable to insert Users', err);
        //     }
        //     console.log(JSON.stringify(result.ops, null, 2));
        //     var _id = result.ops[0]._id;
        //     console.log(_id.getTimestamp());
        // });

        client.close();
    })