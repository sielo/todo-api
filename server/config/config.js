// aby dla TESTOWANIA (*.test.js) odwoływać się do bazy testowej w "package.json"
// dla skrytpu "test" wpisujemy:
// export NODE_ENV=test || SET \"NODE_ENV=test\" && mocha server/**/*.test.js
// a to oznacza że na OSX/Linux odpali się "export" na Windows odpali się "SET" a potem odpali się "mocha"
// i dojdzie do testów
// Dzięki temu rozpoznajemy że aplikacja działa w trybie "test" i możemy używać innej bay mongoDB aby sobie nie rozpieprzć "developerskiej"
// UWAGA! Heroku ustawia NODE_ENV na "production"
// Jeśli odpalimy "npm run test" --> to będzie "test" z powodu "script" w package.json
// Jeśli odpalimy normalnie to będzie "development" bo zmienna NODE_ENV nie istnieje na maszynie CELSIUS
var env = process.env.NODE_ENV || 'development';  
console.log(`env ***** ${env}`);
if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://62.181.8.34:27018/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://62.181.8.34:27018/TodoApp_TEST';
}
