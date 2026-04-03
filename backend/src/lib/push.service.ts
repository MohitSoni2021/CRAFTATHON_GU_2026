import webpush from 'web-push';

let isVapidConfigured = false;

function ensureVapidConfigured() {
  if (isVapidConfigured) return;
  const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  as string;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string;
  const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:admin@medtrack.com';

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[PushService] VAPID keys not configured in environment.');
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  isVapidConfigured = true;
}

export interface PushPayload {
  title: string;
  body:  string;
  icon?: string;
  url?:  string;
  tag?:  string;
}

/**
 * Send a Web Push notification to a single subscription object.
 * Returns true on success, false on any error (e.g. subscription expired).
 */
export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<boolean> {
  ensureVapidConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth:   subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    console.error('[PushService] Failed to send notification:', err?.statusCode || err?.message);
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      throw new Error('SubscriptionExpired');
    }
    return false;
  }
}

export { webpush };
