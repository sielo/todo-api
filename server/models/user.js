var mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength:7,
        trim:true  // usuwa spacje z napisu (początek i koniec)
    }
});

module.exports = {User};