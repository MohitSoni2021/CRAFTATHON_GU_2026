import api from './api/axios';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Convert a base64url string to a Uint8Array — required by PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks current notification permission state.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Full flow:
 * 1. Request permission
 * 2. Register service worker
 * 3. Subscribe to push manager
 * 4. POST subscription to backend
 *
 * Returns the final permission state.
 */
export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  permission: NotificationPermission | 'unsupported';
  message: string;
}> {
  if (typeof window === 'undefined') {
    return { success: false, permission: 'unsupported', message: 'Not in browser context' };
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, permission: 'unsupported', message: 'Push notifications are not supported in this browser' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, permission: 'denied', message: 'VAPID key not configured' };
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      success: false,
      permission,
      message: permission === 'denied'
        ? 'Notification permission denied. Please enable it in your browser settings.'
        : 'Notification permission was not granted.',
    };
  }

  try {
    // 2. Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 3. Subscribe to push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer.slice(0) as ArrayBuffer,
    });

    const subJson = subscription.toJSON();

    // 4. POST to backend
    await api.post('/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
    });

    return { success: true, permission: 'granted', message: 'Push notifications enabled!' };
  } catch (err: any) {
    console.error('[Push] Subscribe error:', err);
    return {
      success: false,
      permission: Notification.permission,
      message: err?.message || 'Failed to enable push notifications',
    };
  }
}

/**
 * Unsubscribe from push notifications and remove from backend.
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }

    await api.post('/push/unsubscribe');
    return true;
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err);
    return false;
  }
}

/**
 * Send a test push notification via backend.
 */
export async function sendTestPushNotification(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post('/push/test');
    return { success: res.data.success, message: res.data.message };
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Failed to send test notification';
    return { success: false, message: msg };
  }
}

/**
 * Check if the user has an active push subscription on the backend.
 */
export async function getPushStatus(): Promise<boolean> {
  try {
    const res = await api.get('/push/status');
    return res.data?.data?.subscribed ?? false;
  } catch {
    return false;
  }
}
