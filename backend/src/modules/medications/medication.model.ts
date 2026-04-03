import mongoose, { Schema, Document } from 'mongoose';
import { FrequencyType, FrequencyTypeValues } from '@hackgu/shared';

export interface IMedication extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  unit: string;
  frequency: FrequencyType;
  scheduleTimes: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
}

const MedicationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  unit: { type: String, required: true },
  frequency: { type: String, enum: FrequencyTypeValues, required: true },
  scheduleTimes: [{ type: String, required: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },
  isActive: { type: Boolean, default: true, index: true },
  notes: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMedication>('Medication', MedicationSchema);
