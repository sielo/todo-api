var mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength:1,
        trim:true  // usuwa spacje z napisu (początek i koniec)
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default:null
    }
});

module.exports = {Todo};