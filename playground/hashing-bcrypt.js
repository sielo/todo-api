const { SHA256 } = require('crypto-js');
const bcrypt = require('bcryptjs');   // https://www.npmjs.com/package/bcryptjs

var pass = '123abc!';
var salt = bcrypt.genSalt(10, (err, salt) => {
    var hash = bcrypt.hash(pass, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPass = '$2a$10$lFF8OhGt7SvAamA57LbjGOmaJ2PgQ2Tv016o9HOIKHVUoY59HaJeG';

bcrypt.compare(pass, hashedPass, (err, res) => {
    // res = true / false
    if (err) {
        console.log(err);
    } else console.log(res);
});
