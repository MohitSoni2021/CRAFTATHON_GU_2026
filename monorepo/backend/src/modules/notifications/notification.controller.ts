import { Response } from 'express';
import Notification from './notification.model';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id, isRead: false })
      .sort({ scheduledAt: -1 });
    res.json({ success: true, data: notifications });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isRead: true, sentAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notif });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, isRead: false },
      { isRead: true, sentAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
