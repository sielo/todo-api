const mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html
const valid = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
//
const SECRETCODE = 'abc123'
//
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

// "MySchema.methods"
// to obiekt zawierający metody wywoływane na OBIEKTACH klasy "MySchema"
// np. "user.<metoda>"
// "MySchema.statics"
// to obiekt zawierający metody wywoływane na KLASIE/MODELU "MySchema"
// np. "User.<metoda>" 

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
    var token = jwt.sign({ _id: user._id.toHexString(), access }, SECRETCODE).toString();
    user.tokens.push({ access, token });
    // zwracamy "Promise" z tej funkcji
    return user.save().then(() => {
        return token; // jeśli zwracamy nie "Promise" tylko wartość to będzie to argument w wyołaniu "success" następnego "then".
    }/*,(err)=>{
        console.log(err);
    }*/);

};

UserSchema.methods.removeToken = function (tokn) {
    var user = this;
    return user.update({
        // parametr $pull usuwa z tablicy "tokens" cały obiekt którego właściwość "token" ma wartość "tokn"
        // i zapisuje "user" do bazy
        $pull: {
            tokens: {
                token: tokn
            }
        }
    });
};

// "statics" oznacza że to będzie funkcja KLASY a nie OBJEKTU
// Czyli wywołujemy ją jako "User.<funkcja>" (na klasie/modelu User) a nie jako "user.<funkcja" (na obiekcie klasy User)
UserSchema.statics.findByToken = function (token) {
    var User = this;  // bindujemy do KLASY/MODELU (User) a nie do objektu (user)
    var decoded;  // undefined!
    try {
        decoded = jwt.verify(token, SECRETCODE);
    } catch (err) {
        // ponieważ "jwt.verify" wyrzuca błąd który łapiemy
        // musimy zwrócić obietnicę która robi "reject()" bo skoro nie było tokena to nie można wykonywać dalszych operacji
        return Promise.reject('Błąd tokena!');
    }
    // zwracamy "resolve obietnicę aby chainować. Wynikiem tej obietnicy będzie "user" bo to wynik "findOne"
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;  // bindujemy do KLASY/MODELU (User) a nie do objektu (user)
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('Invalid email or password');
        }
        // użytkownik jest to sprawdzamy czy hasło jest OK
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, ok) => {
                // ok = true / false
                if (ok) {
                    resolve(user);  // zwracamy "user" aby potem użyć to w "then(user) => .... "
                } else {
                    reject();
                }
            });
        });

    }).catch((err) => {
        res.send('Invalid email or password:::' + err);
    })
};



// definicja middleware w mongoose : http://mongoosejs.com/docs/middleware.html
// Funkcja "pre" dodaje dla wskazanej operacji funkcję wykonywaną PRZED tą operacją
// argument "next" to funkcja która MUSI być wywołana w kodzie aby doszło do zakończenia tej operacji
UserSchema.pre('save', function (next) {
    var user = this;
    // tutaj będziemy hashować hasło.
    // musimy jednak najpierw sprawdzić zy sotao zmienione. Bo jeśli NIE to jest ono już "zahashowane".
    // ale jeśli użytkownik wpisał NOWE hasło to wtedy jest niezahashowane i trzeba je ZAHASHOWAĆ
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            var hash = bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User, SECRETCODE };