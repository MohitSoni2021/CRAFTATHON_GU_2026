import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { generateSwaggerDoc } from './lib/swagger';
import authRoutes         from './modules/auth/auth.route';
import medicationRoutes   from './modules/medications/medication.route';
import doseLogRoutes      from './modules/dose-log/dose-log.route';
import adherenceRoutes    from './modules/adherence/adherence.route';
import caregiverRoutes    from './modules/caregiver/caregiver.route';
import notificationRoutes from './modules/notifications/notification.route';

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateSwaggerDoc()));

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/medications',   medicationRoutes);
app.use('/api/dose-logs',     doseLogRoutes);
app.use('/api/adherence',     adherenceRoutes);
app.use('/api/caregiver',     caregiverRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

export default app;
