const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'SwasthyaSaathi API Documentation',
    description: 'Complete API documentation for the SwasthyaSaathi Backend system. Includes specifications for Authentication, File Uploads, User Management, Doctor endpoints, and Health tracking.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and User Profile endpoints' },
    { name: 'AI', description: 'AI-powered analysis and summaries' },
    { name: 'Measurements', description: 'User health measurements and tracking' },
    { name: 'Lab Reports', description: 'Uploading and managing lab reports' },
    { name: 'Doctor Reports', description: 'Doctor prescriptions and visits' },
    { name: 'Family', description: 'Family group management' },
    { name: 'Admin', description: 'Administrative operations' },
    { name: 'Doctor', description: 'Doctor specific endpoints' },
    { name: 'Medicines', description: 'Medicine references and search' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    },
    schemas: {
      EncryptedPayload: {
        type: 'object',
        properties: {
          encryptedData: {
            type: 'string',
            description: 'AES encrypted payload containing the actual request body. Decrypted server-side.'
          }
        },
        required: ['encryptedData']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'doctor'] },
          age: { type: 'number' },
          isVerified: { type: 'boolean' }
        }
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};

const outputFile = './swagger-output.json';
const routes = [
  './server.js' // It will look for all routes registered in server.js
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc).then(() => {
    console.log('Swagger JSON generated successfully at', outputFile);
});
