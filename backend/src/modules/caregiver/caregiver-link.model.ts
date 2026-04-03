import mongoose, { Schema, Document } from 'mongoose';

export interface ICaregiverLink extends Document {
  patientId: mongoose.Types.ObjectId;
  caregiverId: mongoose.Types.ObjectId;
  relationship: string;
  isActive: boolean;
  linkedAt: Date;
}

const CaregiverLinkSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  caregiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  relationship: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  linkedAt: { type: Date, default: Date.now },
});

// Avoid duplicate links
CaregiverLinkSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

export default mongoose.model<ICaregiverLink>('CaregiverLink', CaregiverLinkSchema);
