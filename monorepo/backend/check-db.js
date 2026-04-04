const mongoose = require('mongoose');
require('dotenv').config({ path: `../.env` });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const PushSub = mongoose.connection.collection('pushsubscriptions');
  const subs = await PushSub.find({}).toArray();
  console.log('Subscriptions:', JSON.stringify(subs, null, 2));

  const ReminderLog = mongoose.connection.collection('reminderlogs');
  const logs = await ReminderLog.find({}, { sort: { createdAt: -1 }, limit: 5 }).toArray();
  console.log('Recent Logs:', JSON.stringify(logs, null, 2));
  process.exit();
}
check();
