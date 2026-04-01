import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { LoginSchema, RegisterSchema } from '@hackgu/shared';

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  summary: 'User login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  summary: 'User register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
    },
  },
});

export function generateSwaggerDoc() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Hackathon API',
      description: 'API for Hackathon Gandhi Nagar',
    },
    servers: [{ url: '/' }],
  });
}
