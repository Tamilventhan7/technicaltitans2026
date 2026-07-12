import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransitOps+ Enterprise API Documentation',
      version: '1.0.0',
      description: 'API specifications for Smart AI Transport Operations Platform.',
      contact: {
        name: 'TransitOps+ Support Team',
        email: 'support@transitops.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
export { default as swaggerUi } from 'swagger-ui-express';
