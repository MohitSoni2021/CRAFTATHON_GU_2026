import mongoose, { Schema, Document } from 'mongoose';
import { DoseStatus, DoseStatusValues } from '@hackgu/shared';

export interface IDoseLog extends Document {
  userId: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  takenAt?: Date;
  status: DoseStatus;
  notes?: string;
  delayMinutes?: number;
  createdAt: Date;
}

const DoseLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
  scheduledAt: { type: Date, required: true },
  takenAt: { type: Date, required: false },
  status: { type: String, enum: DoseStatusValues, required: true, default: DoseStatus.PENDING },
  notes: { type: String, required: false },
  delayMinutes: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
});

// Composite index
DoseLogSchema.index({ userId: 1, scheduledAt: 1 });

export default mongoose.model<IDoseLog>('DoseLog', DoseLogSchema);
