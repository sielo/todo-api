const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
// PRZYDATNE:  httpstatuses.com
var { mongoose } = require('./db/mongoose.js');
var { Todo } = require('./models/todo.js');
var { User } = require('./models/user.js');

var app = express();
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




app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = { app };