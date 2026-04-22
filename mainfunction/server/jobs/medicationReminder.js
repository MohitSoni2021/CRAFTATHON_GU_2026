const cron = require('node-cron');
const MedicationReminder = require('../models/MedicationReminder');

// This job runs every minute to check for due medications
const startMedicationCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentMonthDay = now.getDate();
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm

      // Find active reminders
      const reminders = await MedicationReminder.find({ isActive: true });

      reminders.forEach(reminder => {
        // Check if reminder is due today based on frequencyType
        let isDueToday = false;
        if (reminder.frequencyType === 'daily') {
          isDueToday = true;
        } else if (reminder.frequencyType === 'weekly') {
          // This would need more complex logic to check specific days
          // For simplicity, we assume it's daily if not specified otherwise
          isDueToday = true; 
        } else if (reminder.frequencyType === 'monthly') {
          isDueToday = (reminder.startDate.getDate() === currentMonthDay);
        }

        if (isDueToday) {
          reminder.times.forEach(time => {
            if (time === currentTime) {
              console.log(`Reminder due for medicine: ${reminder.medicineName} at ${time}`);
              // In a real app with Socket.io, we would emit an event here.
              // Since we don't have Socket.io, the client will poll or use local timers.
              // We could also send an email or SMS here if needed.
            }
          });
        }
      });
    } catch (error) {
      console.error('Error in medication reminder cron:', error);
    }
  });
};

module.exports = { startMedicationCron };
