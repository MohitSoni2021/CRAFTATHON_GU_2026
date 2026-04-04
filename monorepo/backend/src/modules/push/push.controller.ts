import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import PushSubscription from './push-subscription.model';
import { sendPushNotification } from '../../lib/push.service';

/**
 * POST /api/push/subscribe
 * Save or update the user's push subscription.
 */
export const subscribe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ success: false, message: 'Invalid subscription object' });
      return;
    }

    await PushSubscription.findOneAndUpdate(
      { userId },
      { userId, endpoint, keys },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: 'Push subscription saved' });
  } catch (err) {
    console.error('[PushCtrl] subscribe error:', err);
    res.status(500).json({ success: false, message: 'Failed to save subscription' });
  }
};

/**
 * POST /api/push/unsubscribe
 * Remove the user's push subscription.
 */
export const unsubscribe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await PushSubscription.findOneAndDelete({ userId });
    res.status(200).json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (err) {
    console.error('[PushCtrl] unsubscribe error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove subscription' });
  }
};

/**
 * POST /api/push/test
 * Send a test push notification to the currently authenticated user.
 */
export const testNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sub = await PushSubscription.findOne({ userId });

    if (!sub) {
      res.status(404).json({ success: false, message: 'No push subscription found. Please enable notifications first.' });
      return;
    }

    const ok = await sendPushNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      {
        title: '🔔 MedTrack Test Notification',
        body:  "Your medication reminders are working! You'll be notified even when the app is closed.",
        icon:  '/icons/medtrack-icon.png',
        url:   '/today',
        tag:   'medtrack-test',
      }
    );

    if (ok) {
      res.status(200).json({ success: true, message: 'Test notification sent!' });
    } else {
      // Subscription may have expired — clean it up
      await PushSubscription.findOneAndDelete({ userId });
      res.status(410).json({ success: false, message: 'Subscription expired. Please re-enable notifications.' });
    }
  } catch (err) {
    console.error('[PushCtrl] testNotification error:', err);
    res.status(500).json({ success: false, message: 'Failed to send test notification' });
  }
};

/**
 * GET /api/push/status
 * Returns whether the current user has an active push subscription.
 */
export const getStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sub = await PushSubscription.findOne({ userId });
    res.status(200).json({ success: true, data: { subscribed: !!sub } });
  } catch (err) {
    console.error('[PushCtrl] getStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to get push status' });
  }
};
