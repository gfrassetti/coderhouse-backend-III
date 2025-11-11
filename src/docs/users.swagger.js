export const usersSwagger = {
    '/api/users': {
        get: {
            tags: ['Users'],
            summary: 'Obtener todos los usuarios',
            description: 'Retorna una lista de todos los usuarios registrados en el sistema',
            responses: {
                200: {
                    description: 'Lista de usuarios obtenida exitosamente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    payload: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/User'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/api/users/{uid}': {
        get: {
            tags: ['Users'],
            summary: 'Obtener un usuario por ID',
            description: 'Retorna la información de un usuario específico por su ID',
            parameters: [
                {
                    name: 'uid',
                    in: 'path',
                    required: true,
                    description: 'ID del usuario',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            responses: {
                200: {
                    description: 'Usuario obtenido exitosamente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    payload: {
                                        $ref: '#/components/schemas/User'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Usuario no encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'User not found'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        put: {
            tags: ['Users'],
            summary: 'Actualizar un usuario',
            description: 'Actualiza la información de un usuario existente',
            parameters: [
                {
                    name: 'uid',
                    in: 'path',
                    required: true,
                    description: 'ID del usuario a actualizar',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserUpdate'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Usuario actualizado exitosamente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'User updated'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Usuario no encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'User not found'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        delete: {
            tags: ['Users'],
            summary: 'Eliminar un usuario',
            description: 'Elimina un usuario del sistema por su ID',
            parameters: [
                {
                    name: 'uid',
                    in: 'path',
                    required: true,
                    description: 'ID del usuario a eliminar',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            responses: {
                200: {
                    description: 'Usuario eliminado exitosamente',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'User deleted'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const usersSchemas = {
    User: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                description: 'ID único del usuario',
                example: '507f1f77bcf86cd799439011'
            },
            first_name: {
                type: 'string',
                description: 'Nombre del usuario',
                example: 'Juan'
            },
            last_name: {
                type: 'string',
                description: 'Apellido del usuario',
                example: 'Pérez'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Correo electrónico del usuario',
                example: 'juan.perez@example.com'
            },
            password: {
                type: 'string',
                description: 'Contraseña encriptada del usuario'
            },
            role: {
                type: 'string',
                enum: ['user', 'admin'],
                description: 'Rol del usuario en el sistema',
                example: 'user',
                default: 'user'
            },
            pets: {
                type: 'array',
                description: 'Array de IDs de mascotas adoptadas por el usuario',
                items: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la mascota'
                        }
                    }
                },
                example: []
            }
        }
    },
    UserUpdate: {
        type: 'object',
        properties: {
            first_name: {
                type: 'string',
                description: 'Nombre del usuario',
                example: 'Juan'
            },
            last_name: {
                type: 'string',
                description: 'Apellido del usuario',
                example: 'Pérez'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Correo electrónico del usuario',
                example: 'juan.perez@example.com'
            },
            role: {
                type: 'string',
                enum: ['user', 'admin'],
                description: 'Rol del usuario en el sistema',
                example: 'user'
            }
        }
    }
};
