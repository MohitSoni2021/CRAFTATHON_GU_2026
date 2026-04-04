import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { startPushReminderJob } from './backend/src/jobs/reminder.job';
mongoose.connect(process.env.MONGODB_URI!).then(async () => {
  const PushSubscription = (await import('./backend/src/modules/push/push-subscription.model')).default;
  const ReminderLog = (await import('./backend/src/modules/push/reminder-log.model')).default;
  console.log("Subscriptions:", await PushSubscription.find({}));
  console.log("Logs:", await ReminderLog.find({}, null, { sort: { createdAt: -1 }, limit: 5 }));
  process.exit(0);
});
