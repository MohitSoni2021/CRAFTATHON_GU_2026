import mongoose, { Schema, Document } from 'mongoose';
import { NotifType, NotifTypeValues } from '@hackgu/shared';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotifType;
  medicationId?: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  scheduledAt: Date;
  sentAt?: Date;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NotifTypeValues, required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: false },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  scheduledAt: { type: Date, required: true, index: true },
  sentAt: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
