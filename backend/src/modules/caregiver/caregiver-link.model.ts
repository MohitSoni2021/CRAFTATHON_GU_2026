import mongoose, { Schema, Document } from 'mongoose';

export interface ICaregiverLink extends Document {
  patientId: mongoose.Types.ObjectId;
  caregiverId?: mongoose.Types.ObjectId;
  caregiverEmail: string;
  relationship: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  permissions: string[];
  invitedAt: Date;
  respondedAt?: Date;
}

const CaregiverLinkSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  caregiverId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  caregiverEmail: { type: String, required: true },
  relationship: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  permissions: { type: [String], default: ['VIEW_ADHERENCE', 'RECEIVE_ALERTS'] },
  invitedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

// Avoid duplicate links for the same patient and caregiver email
CaregiverLinkSchema.index({ patientId: 1, caregiverEmail: 1 }, { unique: true });

export default mongoose.model<ICaregiverLink>('CaregiverLink', CaregiverLinkSchema);
