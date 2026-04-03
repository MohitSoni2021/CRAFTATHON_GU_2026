import cron from 'node-cron';
import Medication from '../modules/medications/medication.model';
import DoseLog from '../modules/dose-log/dose-log.model';
import Notification from '../modules/notifications/notification.model';
import CaregiverLink from '../modules/caregiver/caregiver-link.model';
import { DoseStatus, NotifType } from '@hackgu/shared';

// Job 1 (every 5 min): medications due in the next 15 min → create reminder notification
export const startReminderJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const in15 = new Date(now.getTime() + 15 * 60 * 1000);

      const pendingLogs = await DoseLog.find({
        status: DoseStatus.PENDING,
        scheduledAt: { $gte: now, $lte: in15 },
      }).populate('medicationId');

      for (const log of pendingLogs) {
        const med = log.medicationId as any;
        await Notification.create({
          userId: log.userId,
          type: NotifType.REMINDER,
          medicationId: med._id,
          message: `Reminder: Take ${med.name} (${med.dosage}${med.unit}) at ${log.scheduledAt.toLocaleTimeString()}`,
          isRead: false,
          scheduledAt: log.scheduledAt,
        });
      }
    } catch (e) {
      console.error('[ReminderJob]', e);
    }
  });
};

// Job 2 (every 10 min): overdue pending → missed + alert caregiver
export const startMissedDoseJob = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      const overdue = await DoseLog.find({
        status: DoseStatus.PENDING,
        scheduledAt: { $lt: now },
      }).populate('medicationId');

      for (const log of overdue) {
        log.status = DoseStatus.MISSED;
        await log.save();

        const med = log.medicationId as any;
        await Notification.create({
          userId: log.userId,
          type: NotifType.MISSED_DOSE,
          medicationId: med._id,
          message: `Missed dose: ${med.name} was scheduled at ${log.scheduledAt.toLocaleTimeString()}`,
          isRead: false,
          scheduledAt: now,
        });

        // Alert caregivers real-time
        const { emitToCaregivers } = await import('../lib/socket-manager');
        await emitToCaregivers(log.userId.toString(), 'dose_missed', {
          medicationName: (log.medicationId as any).name,
          message: `Your patient missed a dose of ${(log.medicationId as any).name}`
        });

        const links = await CaregiverLink.find({ patientId: log.userId, isActive: true });
        for (const link of links) {
          await Notification.create({
            userId: link.caregiverId,
            type: NotifType.CAREGIVER_ALERT,
            medicationId: (log.medicationId as any)._id,
            message: `Your patient missed a dose of ${(log.medicationId as any).name}`,
            isRead: false,
            scheduledAt: now,
          });
        }
      }
    } catch (e) {
      console.error('[MissedDoseJob]', e);
    }
  });
};

// Job 3 (daily 23:59): generate dose log stubs for next day
export const startDailyScheduleJob = () => {
  cron.schedule('59 23 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const activeMeds = await Medication.find({ isActive: true });

      for (const med of activeMeds) {
        for (const timeStr of med.scheduleTimes) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledAt = new Date(tomorrow);
          scheduledAt.setHours(hours, minutes, 0, 0);

          const exists = await DoseLog.findOne({
            userId: med.userId,
            medicationId: med._id,
            scheduledAt: { $gte: tomorrow, $lte: tomorrowEnd },
          });
          if (!exists) {
            await DoseLog.create({
              userId: med.userId,
              medicationId: med._id,
              scheduledAt,
              status: DoseStatus.PENDING,
            });
          }
        }
      }
    } catch (e) {
      console.error('[DailyScheduleJob]', e);
    }
  });
};

export const startAllJobs = () => {
  startReminderJob();
  startMissedDoseJob();
  startDailyScheduleJob();
  console.log('✅ Cron jobs started');
};
