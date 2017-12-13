const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
//
const { Todo } = require('./../../models/todo');
const { User, SECRETCODE } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'michal@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, SECRETCODE).toString()
    }]
}, {
    _id: userTwoId,  // celowo generujemy TUTAJ aby użyć tego "_id" w testach /todos/:id
    email: 'jan@example.com',
    password: 'userTwoPass',
}];

// UWAGA! Jeśli generujemy ID przy tworzeniu rekordu w node to potem mongodb nie generuje już nowego ID
const todos = [{
    _id: new ObjectID(),  // celowo generujemy TUTAJ aby użyć tego "_id" w testach /todos/:id
    text: 'Pierwszy Todo'
},
{
    _id: new ObjectID(),
    text: 'Drugi Todo',
    completed: true,
    completedAt: 12345
}
];

const populateTodos = (done) => {
    Todo.remove({})   // kasuje wszystkie Todo
        .then(() => {
            //zwracamy obietnicę dzięki czemu linijkę niżej robimy "=> done()""
            return Todo.insertMany(todos);
        }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({})   // kasuje wszystkie User
        .then(() => {
            // używamy SAVE bo mamy "pre('save'...)" na User które hashuje hasło!
            var userOne = new User(users[0]).save();
            var userTwo = new User(users[1]).save();
            // userX to są obietnice po "save()"
            // zrwacamy opietnicę która zakończy się dopiero jak wszystkie obietnice się zakończą
            return Promise.all([userOne, userTwo]);
        }).then(() => done());
};

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}