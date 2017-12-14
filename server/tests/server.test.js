// npm i expect@1.20.2 mocha nodemon supertest --save-dev
// zmieniamy w package.json sekcję "scripts" dodając to:
//    "test": "mocha server/**/*.test.js",
//    "test-watch": "nodemon --exec \"npm test\""
// npm run test-watch
const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed.js');

// przed każdym testem "it()" wykonuje się to co w beforeEach
beforeEach(populateUsers);
beforeEach(populateTodos);

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
                Todo.find({ text }).then((todos) => {
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
                    expect(todos.length).toBe(2);  // beforeEach dodało DWA "todo". Więc skoro TUTAJ ma się nie tworzyć nowy to musi ich być "2"
                    done();
                }).catch((err) => done(err));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app).get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});


describe('GET /todos/:id', () => {
    it('should return todo', (done) => {
        request(app).get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app).get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if todo for wrong id', (done) => {
        var id = new ObjectID();
        request(app).get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app).delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toEqual(null);
                    //expect(todo).toNotExist();  to niedziała?!
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app).delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if todo for wrong id', (done) => {
        var id = new ObjectID();
        request(app).delete(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update a todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var newTodo = todos[0];
        newTodo.completed = true;
        newTodo.text = 'abcde';
        request(app).patch(`/todos/${hexId}`)
            .send(newTodo)  // to samo co {text: text }
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(newTodo.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
                // Todo.findById(hexId).then((todo) => {
                //     expect(todo).toEqual(null);
                //     //expect(todo).toNotExist();  to niedziała?!
                //     done();
                // }).catch((err) => done(err));
            });
    });
    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString();
        var newTodo = todos[1];
        newTodo.completed = false;
        request(app).patch(`/todos/${hexId}`)
            .send(newTodo)  // to samo co {text: text }
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completedAt).toEqual(null);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
                // Todo.findById(hexId).then((todo) => {
                //     expect(todo).toEqual(null);
                //     //expect(todo).toNotExist();  to niedziała?!
                //     done();
                // }).catch((err) => done(err));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app).patch(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if todo for wrong id', (done) => {
        var id = new ObjectID();
        request(app).patch(`/todos/123`)
            .expect(404)
            .end(done);
    });
});



describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        var hexId = users[0]._id.toHexString();
        var token = users[0].tokens[0].token;
        request(app)
            .get(`/users/me`)
            .set('x-auth', token)  // ustawia header w request
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(hexId);
                expect(res.body.email).toBe(users[0].email);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should return 401 if not authenticated', (done) => {
        var token = users[0].tokens[0].token;
        request(app)
            .get(`/users/me`)
            .set('x-auth', 'abcdef')  // ustawia header w request
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'exam@example.com';
        var password = '12345Fs!';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.header['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            }).end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email }).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password); // bo hasło z bazy jest hashowane. A hasło lokalne jest tekstowe
                    done();
                }).catch((err) => done(err));
            });
    });
    it('should return validation errors if request invalid', (done) => {
        var email = 'exam@example.com';
        var password = '12';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email }).then((user) => {
                    expect(user).toNotExist();
                    done();
                }).catch((err) => { done(err); });

            });
    });
    it('should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = users[0].password;
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});

describe('POST /user/login', () => {
    it('should login a user', (done) => {
        var email = users[1].email;
        var password = users[1].password;
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(email);
                expect(res.header['x-auth']).toExist();
                //expect(res.body.tokens.length).toBe(1);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id.toHexString()).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                }).catch((err) => done(err));
                done();
            });
    });
    it('should reject invalid login', (done) => {
        var email = users[0].email;
        var password = 'sdlksdjsd';
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.header['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id.toHexString()).then((user) => {
                    expect(user.tokens.length).toBe(0);
                }).catch((err) => done(err));
                done();
            });
    });
});