import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../src/config/swagger.js';
import usersRouter from '../src/routes/users.router.js';
import petsRouter from '../src/routes/pets.router.js';
import adoptionsRouter from '../src/routes/adoption.router.js';
import sessionsRouter from '../src/routes/sessions.router.js';
import mocksRouter from '../src/routes/mocks.router.js';
import userModel from '../src/dao/models/User.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

const { expect } = chai;
chai.use(chaiHttp);

describe('Sessions Router Tests', function() {
    this.timeout(30000);
    
    let testUserId;
    let testUserEmail;
    let testUserPassword = 'test123';

    before(async function() {
        try {
            await mongoose.connect('mongodb+srv://guidofrassetti_db_user:bQ5RQoezsCZF7xLe@cluster0.z3ktso1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
                serverSelectionTimeoutMS: 5000
            });
            console.log('Conectado a MongoDB para tests');
        } catch (error) {
            console.error('Error conectando a MongoDB:', error.message);
            console.error('Verifica que tu IP esté en la whitelist de MongoDB Atlas');
            throw error;
        }
    });

    after(async function() {
        try {
            if (testUserId) {
                await userModel.findByIdAndDelete(testUserId);
            }
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
            }
        } catch (error) {
            console.error('Error en after hook:', error);
        }
    });

    describe('POST /api/sessions/register', () => {
        it('Debería registrar un nuevo usuario exitosamente', async () => {
            const testUser = {
                first_name: 'Test',
                last_name: 'User',
                email: `testuser${Date.now()}@test.com`,
                password: testUserPassword
            };

            const res = await chai.request(app)
                .post('/api/sessions/register')
                .send(testUser);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            
            testUserId = res.body.payload;
            testUserEmail = testUser.email;
        });

        it('Debería retornar 400 cuando faltan valores', (done) => {
            const incompleteUser = {
                first_name: 'Test',
                email: 'test@test.com'
            };

            chai.request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'Incomplete values');
                    done();
                });
        });

        it('Debería retornar 400 cuando el usuario ya existe', async () => {
            const existingUser = {
                first_name: 'Existing',
                last_name: 'User',
                email: testUserEmail || `existing${Date.now()}@test.com`,
                password: 'password123'
            };

            if (!testUserEmail) {
                const firstRegister = await chai.request(app)
                    .post('/api/sessions/register')
                    .send(existingUser);
                testUserEmail = existingUser.email;
                testUserId = firstRegister.body.payload;
            }

            const res = await chai.request(app)
                .post('/api/sessions/register')
                .send({
                    first_name: 'Another',
                    last_name: 'User',
                    email: testUserEmail,
                    password: 'password123'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User already exists');
        });
    });

    describe('POST /api/sessions/login', () => {
        it('Debería hacer login exitosamente', async () => {
            const hashedPassword = await bcrypt.hash(testUserPassword, 10);
            const loginUser = await userModel.create({
                first_name: 'Login',
                last_name: 'Test',
                email: `logintest${Date.now()}@test.com`,
                password: hashedPassword,
                role: 'user',
                pets: []
            });
            const loginUserId = loginUser._id.toString();
            const loginUserEmail = loginUser.email;

            const res = await chai.request(app)
                .post('/api/sessions/login')
                .send({
                    email: loginUserEmail,
                    password: testUserPassword
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Logged in');
            expect(res).to.have.cookie('coderCookie');

            const updatedUser = await userModel.findById(loginUserId);
            expect(updatedUser.last_connection).to.not.be.null;
            
            await userModel.findByIdAndDelete(loginUserId);
        });

        it('Debería retornar 400 cuando faltan valores', (done) => {
            chai.request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'test@test.com'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'Incomplete values');
                    done();
                });
        });

        it('Debería retornar 404 cuando el usuario no existe', (done) => {
            chai.request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'User doesn\'t exist');
                    done();
                });
        });

        it('Debería retornar 400 cuando la contraseña es incorrecta', async () => {
            const hashedPassword = await bcrypt.hash(testUserPassword, 10);
            const passwordUser = await userModel.create({
                first_name: 'Password',
                last_name: 'Test',
                email: `passwordtest${Date.now()}@test.com`,
                password: hashedPassword,
                role: 'user',
                pets: []
            });
            const passwordUserId = passwordUser._id.toString();
            const passwordUserEmail = passwordUser.email;

            const res = await chai.request(app)
                .post('/api/sessions/login')
                .send({
                    email: passwordUserEmail,
                    password: 'wrongpassword'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incorrect password');
            
            await userModel.findByIdAndDelete(passwordUserId);
        });
    });
});
