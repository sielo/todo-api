var mongoose = require('mongoose');  // http://mongoosejs.com/docs/guide.html

mongoose.Promise = global.Promise;
var options = {
    //server: { poolSize: 5 },
    //replset: { rs_name: 'myReplicaSetName' },
    user: 'admin',
    pass: '750516',
    authSource: 'admin',
    useMongoClient: true
    //promiseLibrary: global.Promise
}
mongoose.connect(process.env.MONGODB_URI, options);

module.exports = {
    mongoose
}