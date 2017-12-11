const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
// PRZYDATNE:  httpstatuses.com
var { mongoose } = require('./db/mongoose.js');
var { Todo } = require('./models/todo.js');
var { User } = require('./models/user.js');

var app = express();

const port = process.env.PORT || 3000;  // zmienną środowiskową ustawia Heroku

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // "req.body" tworzy się za pomocą "bodyParser.json()" które zostało użyte wcześniej dla requesta
    // ale pod warunkiem że w nagłówku requesta będzie że to "application/json"
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    },
        (err) => {
            res.status(400).send(err);
        });
    //console.log(JSON.stringify(req.body, null, 2));

});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos,
            status: '1'
        });
    },
        (err) => {
            res.status(400).send(err);
        });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('ID not valid');
    }
    Todo.findById(id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send('No ID found');
            }
            res.send({
                todo,
                status: 1
            });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
},
    (err) => {
        res.status(400).send(err);
    }
);

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('ID not valid');
    }
    Todo.findByIdAndRemove(id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send('No ID found');
            }
            res.send({
                todo,
                status: 1
            });
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    // poniższe generuje obiekt składający się TYLKO z właściwości podanych w tablicy
    // nie chcemy aby user modyfikował "completedAt" albo "_id"
    var body = _.pick(req.body, ['text', 'completed']);
    //
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('ID not valid');
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then((todo) => {
            if (!todo) {
                return res.status(404).send('No ID found');
            }
            res.send({
                todo,
                status: 1
            });
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});




// poniższy kod uruchamia serwer TYLKO na "localhost" lub "127.0.0.1"
//  app.listen(3000,'127.0.0.1', () => {
//     console.log('Started on port 3000');
// });

// ten kod uruchamia na localhost, 127.0.0.1 i 10.0.0.38 (adres IP lokalny komputera w sieci)
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };