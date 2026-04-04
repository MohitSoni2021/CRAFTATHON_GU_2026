import mongoose, { Schema, Document } from 'mongoose';

/**
 * Tracks which (userId, medicationId, schedule time, date) combos have already
 * received a push notification — prevents duplicate sends.
 */
export interface IReminderLog extends Document {
  userId: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  scheduledTime: string; // "HH:MM" format
  dateKey: string;       // "YYYY-MM-DD"
  sentAt: Date;
}

const ReminderLogSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User',       required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  scheduledTime:{ type: String, required: true },
  dateKey:      { type: String, required: true },
  sentAt:       { type: Date,   default: Date.now },
});

// Compound unique index — ensures at-most-once delivery
ReminderLogSchema.index({ userId: 1, medicationId: 1, scheduledTime: 1, dateKey: 1 }, { unique: true });

export default mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema);
