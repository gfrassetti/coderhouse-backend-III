import swaggerJSDoc from 'swagger-jsdoc';
import { usersSwagger, usersSchemas } from '../docs/users.swagger.js';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Mascotas y Adopciones',
            version: '1.0.0',
            description: 'API para gestión de usuarios, mascotas y adopciones',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor de desarrollo',
            },
        ],
        paths: Object.assign({}, usersSwagger),
        components: {
            schemas: Object.assign({}, usersSchemas)
        }
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
