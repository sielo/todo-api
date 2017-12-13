const mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html
const valid = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email jest wymagany'],
        minlength: [7, 'Email `{VALUE}` jest za krótki. Należy wpisać co najmniej {MINLENGTH} znaków.'],
        trim: true,  // usuwa spacje z napisu (początek i koniec)
        unique: true,
        validate: {
            validator: valid.isEmail,
            message: '{VALUE} jest nieprawidłowy!',
            isAsync: true // żeby nie było ostrzeżeń
        }
    },
    password: {
        type: String,
        required: [true, 'Hasło jest wymagane'],
        minlength: [6, 'Hasło `{VALUE}` jest za krótkie. Należy wpisać co najmniej {MINLENGTH} znaków.']
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}, {  // options
        usePushEach: true
    });

// rozwiązanie znalezione w dokumentacji:
// http://mongoosejs.com/docs/api.html#document_Document-toObject
// pozwala na transformację każdego obiektu podczas operacji "toJSON"
// Jeśli zamiast "toJSON" podasz "toObject" to wtedy zmiana na obiekt wywołuje najpierw tę transformację
// CIEKAWOSTKA: "toJSON" nie wywołuje w ogóle "toObject"
if (!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
UserSchema.options.toJSON.transform = function (doc, ret, options) {
    // remove the _id of every document before returning the result
    ret = _.pick(ret, ['_id', 'email'])
    return ret;
}
// // toJSON to standardowa metoda w mangoose.
// // za pomocą poniższego kodu robimy "override" i definiujemy tylko te właściwości które chcemy zwrócić
// UserSchema.methods.toJSON = function() {
//     var user = this;
//     var userObject = user.toObject();  // zamienia zmienną Mangoose w obiekt który ma tylko te właściwości które deifinuje schemat

//     return _.pick(userObject, ['_id', 'email']);
// }

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();
    user.tokens.push({ access, token });
    // zwracamy "Promise" z tej funkcji
    return user.save().then(() => {
        return token; // jeśli zwracamy nie "Promise" tylko wartość to będzie to argument w wyołaniu "success" następnego "then".
    }/*,(err)=>{
        console.log(err);
    }*/);

};

var User = mongoose.model('User', UserSchema);

module.exports = { User };