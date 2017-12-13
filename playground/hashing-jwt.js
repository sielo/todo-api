const jwt = require('jsonwebtoken');

var data = {
    id: 10
};

var token = jwt.sign(data, 'saltsecret');
console.log(token);
var decoded = jwt.verify(token,'saltsecret');
console.log(decoded);

// const {SHA256} = require('crypto-js');

// var mess = 'Jestem tutaj';
// var hash = SHA256(mess).toString();

// console.log(`Message: ${mess}`);
// console.log(`Hash: ${hash}`);


// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data)+'somesecret').toString()
// }

// token.data.id = 5;

// var resultHash = SHA256(JSON.stringify(token.data)+'somesecret').toString();

// if (resultHash===token.hash) {
//     console.log('Data was not changed!')
// } else {
//     console.log('Data was changed. Do not trust!')
// }