// npm i expect mocha nodemon supertest --save-dev
// zmieniamy w package.json sekcję "scripts" dodając to:
//    "test": "mocha server/**/*.test.js",
//    "test-watch": "nodemon --exec \"npm test\""
// npm run test-watch
const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

// przed każdym testem "it()" wykonuje się to co w beforeEach
beforeEach((done) => {
    Todo.remove({})   // kasuje wszystkie Todo
        .then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test doto text';
        request(app)
            .post('/todos')
            .send({ text })  // to samo co {text: text }
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, response) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            })
    });

    it('nie powinno utworzyć todo', (done) => {
        request(app)
            .post('/todos')
            .send({})  // błędne wywołanie
            .expect(400)
            .expect((res) => {
                //expect(res.body.text).toBe(text);
            })
            .end((err, response) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(0);
                    done();
                }).catch((err) => done(err));
            })
    });
});