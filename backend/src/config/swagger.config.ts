import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WTRACKER API',
            version: '2.0.0',
            description: 'API para gestión de pedidos de fabricación de ventanas',
            contact: {
                name: 'WTRACKER Team',
                email: 'support@wtracker.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Usuario: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        nombre: {
                            type: 'string',
                            example: 'admin',
                        },
                        email: {
                            type: 'string',
                            example: 'admin@wtracker.com',
                        },
                        rol: {
                            type: 'string',
                            enum: ['Admin', 'Oficina', 'Fabricación', 'Cristal', 'Persianas', 'Transporte', 'Visualización'],
                            example: 'Admin',
                        },
                        activo: {
                            type: 'boolean',
                            example: true,
                        },
                    },
                },
                Pedido: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'PED-2025-001',
                        },
                        fechaEntrada: {
                            type: 'string',
                            format: 'date',
                            example: '2025-01-15',
                        },
                        centro: {
                            type: 'string',
                            example: 'Alcobendas',
                        },
                        material: {
                            type: 'string',
                            enum: ['PVC', 'Aluminio'],
                            example: 'PVC',
                        },
                        fechaVencimiento: {
                            type: 'string',
                            format: 'date',
                            example: '2025-02-15',
                        },
                        estado: {
                            type: 'string',
                            enum: ['Listo', 'En curso', 'Detenido', 'No iniciado'],
                            example: 'En curso',
                        },
                        incidencias: {
                            type: 'string',
                            nullable: true,
                            example: null,
                        },
                        transporte: {
                            type: 'boolean',
                            example: true,
                        },
                        fases: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Fase',
                            },
                        },
                    },
                },
                Fase: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        pedidoId: {
                            type: 'string',
                            example: 'PED-2025-001',
                        },
                        tipo: {
                            type: 'string',
                            enum: ['Fabricación', 'Cristal', 'Persianas', 'Transporte'],
                            example: 'Fabricación',
                        },
                        estado: {
                            type: 'string',
                            enum: ['Completado', 'En proceso', 'Pendiente', 'Bloqueado'],
                            example: 'En proceso',
                        },
                        fechaInicio: {
                            type: 'string',
                            format: 'date',
                            nullable: true,
                            example: '2025-01-15',
                        },
                        fechaFin: {
                            type: 'string',
                            format: 'date',
                            nullable: true,
                            example: null,
                        },
                        operarioId: {
                            type: 'integer',
                            nullable: true,
                            example: 3,
                        },
                        observaciones: {
                            type: 'string',
                            nullable: true,
                            example: 'Proceso normal',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication endpoints',
            },
            {
                name: 'Pedidos',
                description: 'Pedidos management',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
