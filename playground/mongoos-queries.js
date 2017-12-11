const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


var id = '5a2d4433d5852508b8f683f12';

if (!ObjectID.isValid(id)) {
    console.log('id not valid');

}


// Todo.find({       // mongoose
//     _id: id
// }).then((todos) => {
//     console.log('Todos: ', JSON.stringify(todos, null, 2));
// }, (err) => {

// });

// Todo.findOne({     // mongoose
//     _id: id
// }).then((todo) => {
//     console.log('Todo: ', JSON.stringify(todo, null, 2));
// }, (err) => {

// });

// Todo.findById(id)   // mongoose
//     .then((todo) => {
//         if (!todo) {
//             return console.log('ID not found!');
//         }
//         console.log('Todo by id: ', JSON.stringify(todo, null, 2));
//     }).catch((err) => console.log(err));

var id = '5a2c246fcace773c8c000a4c';
User.findById(id)
    .then((user) => {
        if (!user) {
            return console.log('User ID not found!');
        }
        console.log('User by id: ', JSON.stringify(user, null, 2));

    }).catch((err) => console.log(err));
