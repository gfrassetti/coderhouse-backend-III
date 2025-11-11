# API de Mascotas y Adopciones

API REST para gestión de usuarios, mascotas y adopciones.

## Stack

Node.js, Express, MongoDB, Mongoose, Swagger, Docker

## Instalación

```bash
npm install
npm start
```

El servidor corre en `http://localhost:8080`

## Documentación

Swagger UI disponible en `http://localhost:8080/api-docs`

Endpoints principales:
- Users: GET, GET/:id, PUT/:id, DELETE/:id
- Pets: GET, POST, PUT/:id, DELETE/:id
- Adoptions: GET, GET/:id, POST/:uid/:pid
- Mocks: GET /mockingpets, GET /mockingusers, POST /generateData

## Tests

```bash
npm test
npm run test:adoption
```

## Docker

Construir imagen:
```bash
docker build -t coderhouse-backend-iii .
```

Ejecutar:
```bash
docker run -p 8080:8080 coderhouse-backend-iii
```

Subir a Dockerhub:
```bash
docker login
docker tag coderhouse-backend-iii <tu-usuario>/coderhouse-backend-iii:latest
docker push <tu-usuario>/coderhouse-backend-iii:latest
```

Imagen en Dockerhub:
```
https://hub.docker.com/r/<tu-usuario>/coderhouse-backend-iii
```

```bash
docker pull <tu-usuario>/coderhouse-backend-iii
docker run -p 8080:8080 <tu-usuario>/coderhouse-backend-iii
```