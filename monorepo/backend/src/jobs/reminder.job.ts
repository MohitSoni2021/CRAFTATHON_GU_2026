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
        await emitToCaregivers(log.userId.toString(), 'DOSE_MISSED', {
          medicationName: (log.medicationId as any).name,
          message: `Your patient missed a dose of ${(log.medicationId as any).name}`
        });

        const links = await CaregiverLink.find({ patientId: log.userId, status: 'ACCEPTED' });
        for (const link of links) {
          if (link.caregiverId) {
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

/**
 * Job 4 (every minute): Push notification reminder at exact medication schedule times.
 * Uses ReminderLog for deduplication — each (user + med + HH:MM + date) fires at most once.
 */
export const startPushReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const PushSubscription = (await import('../modules/push/push-subscription.model')).default;
      const ReminderLog      = (await import('../modules/push/reminder-log.model')).default;
      const User             = (await import('../modules/auth/auth.model')).default;
      const { sendPushNotification } = await import('../lib/push.service');

      // Only look at active medications
      const activeMeds = await Medication.find({ isActive: true });

      for (const med of activeMeds) {
        // Fetch user timezone
        const user = await User.findById(med.userId).select('timezone');
        const tz   = user?.timezone || 'Asia/Kolkata';

        // Current time in user's timezone
        const nowInTz = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
        const currentHH = String(nowInTz.getHours()).padStart(2, '0');
        const currentMM = String(nowInTz.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHH}:${currentMM}`;

        // Date key in user's timezone (YYYY-MM-DD)
        const dateKey = `${nowInTz.getFullYear()}-${String(nowInTz.getMonth() + 1).padStart(2, '0')}-${String(nowInTz.getDate()).padStart(2, '0')}`;

        for (const scheduleTime of med.scheduleTimes) {
          // scheduleTime is stored as "HH:MM"
          const [sH, sM] = scheduleTime.split(':');
          const normalised = `${String(Number(sH)).padStart(2, '0')}:${String(Number(sM)).padStart(2, '0')}`;

          if (normalised !== currentTime) continue;

          // Dedup check
          const alreadySent = await ReminderLog.findOne({
            userId:       med.userId,
            medicationId: med._id,
            scheduledTime: normalised,
            dateKey,
          });
          if (alreadySent) continue;

          // Get push subscription for this user
          const sub = await PushSubscription.findOne({ userId: med.userId });
          if (!sub) continue;

          try {
            const sent = await sendPushNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              {
                title: '💊 Medication Reminder',
                body:  `Time to take ${med.name} ${med.dosage}${med.unit}`,
                icon:  '/icons/medtrack-icon.png',
                url:   '/today',
                tag:   `med-reminder-${med._id}-${normalised}`,
              }
            );

            if (sent) {
              // Record send to prevent duplicates
              await ReminderLog.create({
                userId:       med.userId,
                medicationId: med._id,
                scheduledTime: normalised,
                dateKey,
              });
              console.log(`[PushJob] Sent reminder for ${med.name} to user ${med.userId} at ${normalised}`);
            }
          } catch (pushErr: any) {
            if (pushErr.message === 'SubscriptionExpired') {
              // Subscription expired/invalid — remove it
              await PushSubscription.findOneAndDelete({ userId: med.userId });
              console.warn(`[PushJob] Removed stale push subscription for user ${med.userId}`);
            } else {
              console.error(`[PushJob] Warning - Transient error sending to user ${med.userId}:`, pushErr);
            }
          }
        }
      }
    } catch (e) {
      console.error('[PushReminderJob]', e);
    }
  });
};

export const startAllJobs = () => {
  startReminderJob();
  startMissedDoseJob();
  startDailyScheduleJob();
  startPushReminderJob();
  console.log('✅ Cron jobs started (including push reminder job)');
};
