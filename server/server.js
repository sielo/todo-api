var express = require('express');
var bodyParser = require('body-parser');
// PRZYDATNE:  httpstatuses.com
var { mongoose } = require('./db/mongoose.js');
var { Todo } = require('./models/Todo.js');
var { User } = require('./models/User.js');

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
    console.log(JSON.stringify(req.body, null, 2));

});




app.listen(3000, () => {
    console.log('Started on port 3000');
});