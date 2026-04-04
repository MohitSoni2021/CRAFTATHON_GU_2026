import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const isNotificationsAvailable = () => {
  return (
    !!Notifications &&
    typeof Notifications.getPermissionsAsync === 'function' &&
    typeof Notifications.requestPermissionsAsync === 'function' &&
    typeof Notifications.scheduleNotificationAsync === 'function'
  );
};

export const getNotificationPermissionStatus = async () => {
  if (!isNotificationsAvailable()) {
    console.warn('[localNotificationService] Notifications not available');
    return 'unsupported';
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('[localNotificationService] permission status', status);
    return status ?? 'undetermined';
  } catch (error) {
    console.warn('[localNotificationService] Notification permission status check failed', error);
    return 'undetermined';
  }
};

export const requestNotificationPermission = async () => {
  if (!isNotificationsAvailable()) {
    console.warn('[localNotificationService] requestNotificationPermission: not available');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('[localNotificationService] permission request result', finalStatus);
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[localNotificationService] requesting notification permission failed', error);
    return false;
  }
};

export const initializeNotificationChannel = async () => {
  if (!isNotificationsAvailable()) {
    console.warn('[localNotificationService] initializeNotificationChannel: not available');
    return false;
  }

  try {
    if (Platform.OS === 'android' && typeof Notifications.setNotificationChannelAsync === 'function') {
      const importance = Notifications?.AndroidImportance?.HIGH ?? 4;
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance,
        vibrationPattern: [250, 250, 250],
        lightColor: '#FFBB00',
        sound: 'default',
      });
    }

    console.log('[localNotificationService] initializeNotificationChannel success');
    return true;
  } catch (error) {
    console.warn('[localNotificationService] initialize notification channel failed', error);
    return false;
  }
};

export const cancelAllMedicationNotifications = async () => {
  if (!isNotificationsAvailable()) {
    console.warn('[localNotificationService] cancelAllMedicationNotifications: not available');
    return false;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[localNotificationService] cancelAllMedicationNotifications success');
    return true;
  } catch (error) {
    console.warn('[localNotificationService] cancel all notifications failed', error);
    return false;
  }
};

export const scheduleMedicationReminder = async (dose) => {
  if (!isNotificationsAvailable()) {
    console.warn('[localNotificationService] scheduleMedicationReminder: not available');
    return null;
  }

  const scheduledTime = new Date(dose?.scheduledTime ?? null);
  if (!scheduledTime || Number.isNaN(scheduledTime.getTime())) {
    console.warn('[localNotificationService] invalid scheduledTime', dose?.scheduledTime);
    return null;
  }

  if (dose?.status === 'taken' || scheduledTime <= new Date()) {
    return null;
  }

  try {
    const result = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `Time to take ${dose?.medicationName || 'your medicine'} (${dose?.dosage || 'dose'}).`,
        data: {
          medicationId: dose?.medicationId,
          scheduledTime: dose?.scheduledTime,
        },
      },
      trigger: scheduledTime,
      channelId: 'medication-reminders',
    });

    console.log('[localNotificationService] scheduled notification', result);
    return result;
  } catch (error) {
    console.warn('[localNotificationService] schedule medication reminder failed', error);
    return null;
  }
};
