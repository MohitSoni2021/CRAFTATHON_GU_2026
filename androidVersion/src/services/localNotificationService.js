import { Platform } from 'react-native';

const getNotificationsModule = async () => {
  try {
    const Notifications = await import('expo-notifications');
    return Notifications ?? null;
  } catch (error) {
    console.warn('expo-notifications module unavailable', error);
    return null;
  }
};

const isNotificationsAvailable = (Notifications) => {
  return (
    Notifications &&
    typeof Notifications.getPermissionsAsync === 'function' &&
    typeof Notifications.requestPermissionsAsync === 'function' &&
    typeof Notifications.scheduleNotificationAsync === 'function'
  );
};

export const getNotificationPermissionStatus = async () => {
  const Notifications = await getNotificationsModule();
  if (!isNotificationsAvailable(Notifications)) return 'undetermined';

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status ?? 'undetermined';
  } catch (error) {
    console.warn('Notification permission status check failed', error);
    return 'undetermined';
  }
};

export const requestNotificationPermission = async () => {
  const Notifications = await getNotificationsModule();
  if (!isNotificationsAvailable(Notifications)) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Requesting notification permission failed', error);
    return false;
  }
};

export const initializeNotificationChannel = async () => {
  const Notifications = await getNotificationsModule();
  if (!isNotificationsAvailable(Notifications)) return false;

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
    return true;
  } catch (error) {
    console.warn('Initialize notification channel failed', error);
    return false;
  }
};

export const cancelAllMedicationNotifications = async () => {
  const Notifications = await getNotificationsModule();
  if (!isNotificationsAvailable(Notifications)) return false;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.warn('Cancel all notifications failed', error);
    return false;
  }
};

export const scheduleMedicationReminder = async (dose) => {
  const Notifications = await getNotificationsModule();
  if (!isNotificationsAvailable(Notifications)) return null;

  const scheduledTime = new Date(dose?.scheduledTime ?? null);
  if (!scheduledTime || isNaN(scheduledTime.getTime())) return null;
  if (dose?.status === 'taken' || scheduledTime <= new Date()) {
    return null;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
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
  } catch (error) {
    console.warn('Schedule medication reminder failed', error);
    return null;
  }
};
