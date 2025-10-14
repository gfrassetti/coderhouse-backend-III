import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const generateUsers = async (count) => {
    const users = [];
    const hashedPassword = await bcrypt.hash('coder123', 10);
    
    for (let i = 0; i < count; i++) {
        const user = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: hashedPassword,
            role: Math.random() < 0.5 ? 'user' : 'admin',
            pets: []
        };
        users.push(user);
    }
    
    return users;
};

const generatePets = (count) => {
    const pets = [];
    const species = ['dog', 'cat', 'bird', 'fish', 'hamster', 'rabbit'];
    
    for (let i = 0; i < count; i++) {
        const pet = {
            name: faker.animal.type(),
            specie: species[Math.floor(Math.random() * species.length)],
            birthDate: faker.date.past(),
            adopted: false,
            image: faker.image.url()
        };
        pets.push(pet);
    }
    
    return pets;
};

export { generateUsers, generatePets };
