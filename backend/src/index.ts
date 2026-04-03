import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { startAllJobs } from './jobs/reminder.job';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startAllJobs();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📖 Swagger docs at http://localhost:${port}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
