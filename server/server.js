require('./config/config.js');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');
// PRZYDATNE:  httpstatuses.com
var { mongoose } = require('./db/mongoose.js');
var { Todo } = require('./models/todo.js');
var { User } = require('./models/user.js');
var { authenticate } = require('./middleware/authenticate.js');

var app = express();

const port = process.env.PORT;  // zmienną środowiskową ustawia Heroku

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    // "req.body" tworzy się za pomocą "bodyParser.json()" które zostało użyte wcześniej dla requesta
    // ale pod warunkiem że w nagłówku requesta będzie że to "application/json"
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save().then((doc) => {
        res.send(doc);
    },
        (err) => {
            res.status(400).send(err);
        });
    //console.log(JSON.stringify(req.body, null, 2));

});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then((todos) => {
        res.send({
            todos,
            status: '1'
        });
    },
        (err) => {
            res.status(400).send(err);
        });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('ID not valid');
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
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

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('ID not valid');
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send('No ID found');
        }
        res.send({
            todo,
            status: 1
        });
    }).catch((err) => {
        res.status(400).send(err);
    });

});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, { $set: body }, { new: true })
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


app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();  // zdefiniowana w user.js zwraca Promise z parametrem "token"
    })
        .then((token) => {
            res.header('x-auth', token).send(user);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
    //console.log(JSON.stringify(req.body, null, 2));

});

// "req.user" istnieje ponieważ w "authenticate" po sprawdzeniu tokena - odczytaliśmy usera i go spisaliśmy
// w "req.user". Token jest w "req.token"
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        // generujemy nowy TOKEN
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
        //res.header('x-auth', user.tokens[0].token).send(user);
    }).catch((err) => {
        res.status(400).send('Email or password incorrect!');
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    var token = req.token;
    req.user.removeToken(token).then(() => {
        res.status(200).send('User logged out!');
    }, () => {
        res.status(400).send('Token not removed');
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