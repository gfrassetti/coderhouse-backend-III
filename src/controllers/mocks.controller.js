import { generateUsers, generatePets } from '../utils/mocking.js';
import { usersService, petsService } from '../services/index.js';

const mockingPets = async (req, res) => {
    const pets = generatePets(100);
    res.send({ status: "success", payload: pets });
};

const mockingUsers = async (req, res) => {
    const count = parseInt(req.query.count) || 50;
    const users = await generateUsers(count);
    res.send({ status: "success", payload: users });
};

const generateData = async (req, res) => {
    try {
        const { users, pets } = req.body;
        
        if (!users || !pets) {
            return res.status(400).send({ 
                status: "error", 
                message: "Los parámetros users y pets son requeridos" 
            });
        }

        const userCount = parseInt(users);
        const petCount = parseInt(pets);

        if (isNaN(userCount) || isNaN(petCount) || userCount < 0 || petCount < 0) {
            return res.status(400).send({ 
                status: "error", 
                message: "Users y pets deben ser números positivos válidos" 
            });
        }

        const generatedUsers = await generateUsers(userCount);
        const generatedPets = generatePets(petCount);

        const insertedUsers = await usersService.save(generatedUsers);
        const insertedPets = await petsService.save(generatedPets);

        res.send({ 
            status: "success", 
            message: "Datos generados e insertados exitosamente",
            payload: {
                users: insertedUsers,
                pets: insertedPets
            }
        });
    } catch (error) {
        res.status(500).send({ 
            status: "error", 
            message: "Error generando datos", 
            error: error.message 
        });
    }
};

export default {
    mockingPets,
    mockingUsers,
    generateData
};
