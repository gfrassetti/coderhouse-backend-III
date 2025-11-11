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
import petModel from '../src/dao/models/Pet.js';
import adoptionModel from '../src/dao/models/Adoption.js';
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

describe('Adoption Router Tests', function() {
    this.timeout(10000);
    
    let testUserId;
    let testPetId;
    let testAdoptionId;

    before(async () => {
        await mongoose.connect('mongodb+srv://guidofrassetti_db_user:bQ5RQoezsCZF7xLe@cluster0.z3ktso1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        
        const hashedPassword = await bcrypt.hash('test123', 10);
        const testUser = await userModel.create({
            first_name: 'Test',
            last_name: 'User',
            email: `testuser${Date.now()}@test.com`,
            password: hashedPassword,
            role: 'user',
            pets: []
        });
        testUserId = testUser._id.toString();

        const testPet = await petModel.create({
            name: 'Test Pet',
            specie: 'dog',
            birthDate: new Date(),
            adopted: false
        });
        testPetId = testPet._id.toString();
    });

    after(async () => {
        if (testUserId) {
            await userModel.findByIdAndDelete(testUserId);
        }
        if (testPetId) {
            await petModel.findByIdAndDelete(testPetId);
        }
        if (testAdoptionId) {
            await adoptionModel.findByIdAndDelete(testAdoptionId);
        }
        await mongoose.connection.close();
    });

    describe('GET /api/adoptions', () => {
        it('Debería obtener todas las adopciones exitosamente', (done) => {
            chai.request(app)
                .get('/api/adoptions')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('status', 'success');
                    expect(res.body).to.have.property('payload');
                    expect(res.body.payload).to.be.an('array');
                    done();
                });
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        it('Debería obtener una adopción por ID exitosamente', async () => {
            const adoption = await adoptionModel.create({
                owner: testUserId,
                pet: testPetId
            });
            testAdoptionId = adoption._id.toString();

            const res = await chai.request(app)
                .get(`/api/adoptions/${testAdoptionId}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.have.property('_id');
        });

        it('Debería retornar 404 cuando la adopción no existe', (done) => {
            const fakeId = new mongoose.Types.ObjectId();
            chai.request(app)
                .get(`/api/adoptions/${fakeId}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'Adoption not found');
                    done();
                });
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('Debería crear una adopción exitosamente', async () => {
            const newUser = await userModel.create({
                first_name: 'Adopt',
                last_name: 'User',
                email: `adoptuser${Date.now()}@test.com`,
                password: await bcrypt.hash('test123', 10),
                role: 'user',
                pets: []
            });
            const newUserId = newUser._id.toString();

            const newPet = await petModel.create({
                name: 'Adoptable Pet',
                specie: 'cat',
                birthDate: new Date(),
                adopted: false
            });
            const newPetId = newPet._id.toString();

            const res = await chai.request(app)
                .post(`/api/adoptions/${newUserId}/${newPetId}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Pet adopted');

            const updatedUser = await userModel.findById(newUserId);
            expect(updatedUser.pets).to.include(newPetId);

            const updatedPet = await petModel.findById(newPetId);
            expect(updatedPet.adopted).to.be.true;
            expect(updatedPet.owner.toString()).to.equal(newUserId);

            await userModel.findByIdAndDelete(newUserId);
            await petModel.findByIdAndDelete(newPetId);
            await adoptionModel.deleteOne({ owner: newUserId, pet: newPetId });
        });

        it('Debería retornar 404 cuando el usuario no existe', (done) => {
            const fakeUserId = new mongoose.Types.ObjectId();
            chai.request(app)
                .post(`/api/adoptions/${fakeUserId}/${testPetId}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'user Not found');
                    done();
                });
        });

        it('Debería retornar 404 cuando la mascota no existe', (done) => {
            const fakePetId = new mongoose.Types.ObjectId();
            chai.request(app)
                .post(`/api/adoptions/${testUserId}/${fakePetId}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property('error', 'Pet not found');
                    done();
                });
        });

        it('Debería retornar 400 cuando la mascota ya está adoptada', async () => {
            const adoptedUser = await userModel.create({
                first_name: 'Owner',
                last_name: 'User',
                email: `owneruser${Date.now()}@test.com`,
                password: await bcrypt.hash('test123', 10),
                role: 'user',
                pets: []
            });
            const adoptedUserId = adoptedUser._id.toString();

            const adoptedPet = await petModel.create({
                name: 'Already Adopted',
                specie: 'bird',
                birthDate: new Date(),
                adopted: true,
                owner: adoptedUserId
            });
            const adoptedPetId = adoptedPet._id.toString();

            const res = await chai.request(app)
                .post(`/api/adoptions/${testUserId}/${adoptedPetId}`);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Pet is already adopted');

            await userModel.findByIdAndDelete(adoptedUserId);
            await petModel.findByIdAndDelete(adoptedPetId);
        });
    });
});
