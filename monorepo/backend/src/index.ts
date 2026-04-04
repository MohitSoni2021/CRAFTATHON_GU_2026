import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import app from './app';
import { startAllJobs } from './jobs/reminder.job';
import { initSocket } from './lib/socket-manager'

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startAllJobs();
    httpServer.listen(port, () => {
      console.log(`✅ Server (with Socket.io) running on port ${port}`);
      console.log(`📖 Swagger docs at http://localhost:${port}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
