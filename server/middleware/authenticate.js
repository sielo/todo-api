const { User } = require('./../models/user');

// funkcja jest "middleware" na potrzeby "express'a". Będzie wywoływana PRZED obsługą 
// wywołań (GET/POST/DELETE itp) i będzie pozwalała na autentykację wywołań po wcześniejszym "zalogowaniu się"
// użytkownika.
// MIDDLEWARE ma zawsze 3 argumenty : "request", "response" i "next".
// "next" musi być zawsze wywołana aby wyjść z middleware i wykonać następne polecenie.
//
// Wywołanie tego wygląda tak :
// app.<operacja GET/POST itp.>('/ścieżka', authenticate, (req,res) => {...tutaj req będzie zawierał req.user, req.token.....})
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    //
    // wynikiem "findByToken" jest obietnica z parametrem "user" (pochodząca z User.findOne)
    // lub "reject" jeśli był błąd w tokenie
    // Jeśli nie ma usera to "user===null" ale jest "resolve(user)"
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('Brak wskazanego usera!');
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((err) => {
        res.status(401).send('Authentication required!:::' + err);
    });
};

module.exports = { authenticate };