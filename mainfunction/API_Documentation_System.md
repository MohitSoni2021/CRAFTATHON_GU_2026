# SwasthyaSaathi API Documentation System

This document provides a complete, production-ready setup for your Node.js + Express backend to automatically generate OpenAPI (Swagger) documentation and a fully-featured Postman Collection.

## 1. Setup Instructions

First, install the necessary dependencies in your `server` directory:

```bash
cd server
npm install swagger-ui-express swagger-autogen openapi-to-postmanv2 --save
```

Then, modify your `server.js` to serve the generated Swagger UI:

```javascript
// Add these imports at the top
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

// Add this before your routes (e.g. app.use("/api/auth", authRoutes);)
try {
  const swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));
  console.log('Swagger UI available at http://localhost:5000/api-docs');
} catch (error) {
  console.log('Swagger JSON not found. Run "node swagger.js" to generate it.');
}
```

## 2. Swagger Config File (`swagger.js`)

Create this `swagger.js` file in your `server` directory. It uses `swagger-autogen` to automatically parse your Express routes and generates the `swagger-output.json` file. It also sets up reusable schemas and handles the AES encrypted payload special case.

```javascript
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
    { name: 'Diary', description: 'Health diary management' },
    // ... add more tags as needed
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
          user: { $ref: '#/components/schemas/User' }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'doctor'] },
          isVerified: { type: 'boolean' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const outputFile = './swagger-output.json';
// Point this to your main server.js or index.js
const routes = ['./server.js']; 

swaggerAutogen(outputFile, routes, doc).then(() => {
    console.log('Swagger JSON generated successfully at', outputFile);
});
```

## 3. Example Annotated Route File (`routes/diary.js`)

While `swagger-autogen` can infer basic routes automatically, you can add JSDoc comments to your routes to ensure 100% accuracy for payloads and descriptions.

```javascript
const express = require("express");
const diaryController = require("./diaryController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Diary
 *   description: Health diary management endpoints
 */

/**
 * @swagger
 * /api/diary:
 *   post:
 *     summary: Create a new diary entry
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, text, date]
 *             properties:
 *               title: { type: string }
 *               text: { type: string }
 *               date: { type: string, format: date }
 *               mood: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Diary entry created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post("/", diaryController.createDiaryEntry);

// ... other routes
module.exports = router;
```

*Note: For encrypted endpoints like Auth Login, the request body should reference the `$ref: '#/components/schemas/EncryptedPayload'`.*

## 4. Postman Collection Generator Script

Create `generate-postman.js` in your `server` directory. This script uses the generated `swagger-output.json` to automatically build your Postman collection with the pre-request scripts.

```javascript
const fs = require('fs');
const Converter = require('openapi-to-postmanv2');

const openapiData = fs.readFileSync('swagger-output.json', { encoding: 'UTF8' });

Converter.convert({ type: 'string', data: openapiData },
  { folderStrategy: 'Tags', includeAuthInfoInExample: true },
  (err, conversionResult) => {
    if (!conversionResult.result) {
      console.log('Could not convert', conversionResult.reason);
    } else {
      const collection = conversionResult.output[0].data;
      
      // Inject Pre-request Scripts globally or conditionally for Auth routes
      const encryptScript = `
        const rawBody = pm.request.body.raw;
        if (rawBody && pm.request.url.getPath().includes('/auth')) {
            const secret = pm.environment.get("crypto_secret") || "default_secret_key";
            const encrypted = CryptoJS.AES.encrypt(rawBody, secret).toString();
            pm.request.body.update(JSON.stringify({ encryptedData: encrypted }));
        }
      `;
      
      collection.event = [
        {
          listen: "prerequest",
          script: { type: "text/javascript", exec: encryptScript.split('\n') }
        }
      ];

      fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 2));
      console.log('Postman Collection generated at postman_collection.json');
    }
  }
);
```

## 5. Execution Steps

1. Run `node swagger.js` to parse your routes and generate `swagger-output.json` (OpenAPI).
2. Run `node generate-postman.js` to convert the OpenAPI spec to `postman_collection.json`.
3. Start your server with `npm run dev`.
4. Visit `http://localhost:5000/api-docs` to view the interactive Swagger documentation.
5. Import `postman_collection.json` into Postman. It will have all 100+ endpoints automatically structured by tags, with the AES encryption pre-request scripts included.
