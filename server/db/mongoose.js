var mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/TodoApp', { useMongoClient: true });

module.exports = {
    mongoose
}