
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27018',
    (err, client) => {
        if (err) {
            return console.log('Unable to connect to MongoDB', err);
        }
        console.log('Connected!');
        const db = client.db('TodoApp');
        // findOneAndUpdate
        // https://docs.mongodb.com/v3.6/reference/operator/update/
        // db.collection('Todos').findOneAndUpdate({
        //     _id: new ObjectID("5a2c0f9c7cd7ee35d85e958c")
        // }, {
        //         $set: {
        //             completed: true
        //         }
        //     }, {
        //         returnOriginal: false
        //     }).
        //     then((result) => {
        //         console.log(result)
        //     });
        db.collection('Users').findOneAndUpdate({
            _id: new ObjectID("5a2bfeebc6884f10582f96c6")
        }, {
                $set: {
                    name: 'Zdzichu'
                },
                $inc: {
                    age:1
                }
            }, {
                returnOriginal: false
            }).
            then((result) => {
                console.log(result)
            });


        //client.close();
    })