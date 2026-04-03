import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
  CreateMedicationSchema,
  UpdateMedicationSchema,
  LogDoseSchema,
  LinkCaregiverSchema,
  UserRole,    UserRoleValues,
  DoseStatus,  DoseStatusValues,
  FrequencyType, FrequencyTypeValues,
  RiskLevel,   RiskLevelValues,
  NotifType,   NotifTypeValues,
} from '@hackgu/shared';

const registry = new OpenAPIRegistry();

// ─── Enum Components ──────────────────────────────────────────────
registry.registerComponent('schemas', 'UserRole',      { type: 'string', enum: UserRoleValues,      example: UserRole.PATIENT });
registry.registerComponent('schemas', 'DoseStatus',    { type: 'string', enum: DoseStatusValues,    example: DoseStatus.PENDING });
registry.registerComponent('schemas', 'FrequencyType', { type: 'string', enum: FrequencyTypeValues, example: FrequencyType.DAILY });
registry.registerComponent('schemas', 'RiskLevel',     { type: 'string', enum: RiskLevelValues,     example: RiskLevel.LOW });
registry.registerComponent('schemas', 'NotifType',     { type: 'string', enum: NotifTypeValues,     example: NotifType.REMINDER });

// ─── Schema Registration ──────────────────────────────────────────
registry.register('Login',            LoginSchema);
registry.register('Register',         RegisterSchema);
registry.register('AuthResponse',     AuthResponseSchema);
registry.register('CreateMedication', CreateMedicationSchema);
registry.register('UpdateMedication', UpdateMedicationSchema);
registry.register('LogDose',          LogDoseSchema);
registry.register('LinkCaregiver',    LinkCaregiverSchema);

// ─── Auth Routes ──────────────────────────────────────────────────
registry.registerPath({ method: 'post', path: '/api/auth/login',    tags: ['Auth'], summary: 'Login',    request: { body: { content: { 'application/json': { schema: LoginSchema    } } } }, responses: { 200: { description: 'Login OK', content: { 'application/json': { schema: AuthResponseSchema } } }, 401: { description: 'Unauthorized' } } });
registry.registerPath({ method: 'post', path: '/api/auth/register', tags: ['Auth'], summary: 'Register', request: { body: { content: { 'application/json': { schema: RegisterSchema } } } }, responses: { 201: { description: 'Created', content: { 'application/json': { schema: AuthResponseSchema } } }, 400: { description: 'Exists'       } } });
registry.registerPath({ method: 'post', path: '/api/auth/google',   tags: ['Auth'], summary: 'Google OAuth', request: { body: { content: { 'application/json': { schema: { type: 'object', properties: { credential: { type: 'string' } } } as any } } } }, responses: { 200: { description: 'OK' } } });

// ─── Medication Routes ────────────────────────────────────────────
registry.registerPath({ method: 'post',   path: '/api/medications',     tags: ['Medications'], summary: 'Create medication', request: { body: { content: { 'application/json': { schema: CreateMedicationSchema } } } }, responses: { 201: { description: 'Created' } } });
registry.registerPath({ method: 'get',    path: '/api/medications',     tags: ['Medications'], summary: 'List medications',  responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get',    path: '/api/medications/{id}',tags: ['Medications'], summary: 'Get medication by ID', responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } });
registry.registerPath({ method: 'put',    path: '/api/medications/{id}',tags: ['Medications'], summary: 'Update medication', request: { body: { content: { 'application/json': { schema: UpdateMedicationSchema } } } }, responses: { 200: { description: 'Updated' } } });
registry.registerPath({ method: 'delete', path: '/api/medications/{id}',tags: ['Medications'], summary: 'Deactivate medication', responses: { 200: { description: 'Deactivated' } } });

// ─── Dose Log Routes ──────────────────────────────────────────────
registry.registerPath({ method: 'post', path: '/api/dose-logs',         tags: ['Dose Logs'], summary: 'Log a dose', request: { body: { content: { 'application/json': { schema: LogDoseSchema } } } }, responses: { 201: { description: 'Logged' } } });
registry.registerPath({ method: 'get',  path: '/api/dose-logs',         tags: ['Dose Logs'], summary: 'Get dose logs (filtered)', responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get',  path: '/api/dose-logs/today',   tags: ['Dose Logs'], summary: "Today's scheduled doses", responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'put',  path: '/api/dose-logs/{id}',    tags: ['Dose Logs'], summary: 'Update a dose log', responses: { 200: { description: 'OK' } } });

// ─── Adherence Routes ─────────────────────────────────────────────
registry.registerPath({ method: 'get', path: '/api/adherence/score',    tags: ['Adherence'], summary: 'Overall adherence score', responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get', path: '/api/adherence/daily',    tags: ['Adherence'], summary: 'Daily breakdown',         responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get', path: '/api/adherence/weekly',   tags: ['Adherence'], summary: 'Weekly trend',            responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get', path: '/api/adherence/patterns', tags: ['Adherence'], summary: 'Pattern detection',       responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get', path: '/api/adherence/risk',     tags: ['Adherence'], summary: 'Current risk level',      responses: { 200: { description: 'OK' } } });

// ─── Caregiver Routes ─────────────────────────────────────────────
registry.registerPath({ method: 'post',   path: '/api/caregiver/link',                    tags: ['Caregiver'], summary: 'Link caregiver', request: { body: { content: { 'application/json': { schema: LinkCaregiverSchema } } } }, responses: { 201: { description: 'Linked' } } });
registry.registerPath({ method: 'get',    path: '/api/caregiver/patients',                tags: ['Caregiver'], summary: 'Get my patients', responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'get',    path: '/api/caregiver/patients/{id}/adherence', tags: ['Caregiver'], summary: "Patient's adherence", responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'delete', path: '/api/caregiver/link/{id}',               tags: ['Caregiver'], summary: 'Unlink caregiver', responses: { 200: { description: 'Unlinked' } } });

// ─── Notification Routes ──────────────────────────────────────────
registry.registerPath({ method: 'get', path: '/api/notifications',           tags: ['Notifications'], summary: 'Get unread notifications', responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'put', path: '/api/notifications/{id}/read', tags: ['Notifications'], summary: 'Mark one read',            responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'put', path: '/api/notifications/read-all',  tags: ['Notifications'], summary: 'Mark all read',            responses: { 200: { description: 'OK' } } });

// ─── Push Notification Routes ─────────────────────────────────────
registry.registerPath({ method: 'get',  path: '/api/push/status',      tags: ['Push Notifications'], summary: 'Get push subscription status', responses: { 200: { description: 'OK' } } });
registry.registerPath({ method: 'post', path: '/api/push/subscribe',   tags: ['Push Notifications'], summary: 'Save push subscription',      request: { body: { content: { 'application/json': { schema: { type: 'object', properties: { endpoint: { type: 'string' }, keys: { type: 'object', properties: { p256dh: { type: 'string' }, auth: { type: 'string' } } } } } as any } } } }, responses: { 200: { description: 'Subscribed' } } });
registry.registerPath({ method: 'post', path: '/api/push/unsubscribe', tags: ['Push Notifications'], summary: 'Remove push subscription',     responses: { 200: { description: 'Unsubscribed' } } });
registry.registerPath({ method: 'post', path: '/api/push/test',        tags: ['Push Notifications'], summary: 'Send test push notification',  responses: { 200: { description: 'Sent' }, 404: { description: 'No subscription' } } });

// ─── Security Scheme ──────────────────────────────────────────────
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export function generateSwaggerDoc() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '2.0.0',
      title: 'Medication Adherence API',
      description: 'Full REST API for the Medication Non-Adherence Monitoring System — Gujarat Hackathon 2026',
    },
    servers: [{ url: '/' }],
    security: [{ bearerAuth: [] }],
  });
}
