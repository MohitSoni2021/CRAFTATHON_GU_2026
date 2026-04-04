import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorPatientLink extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  specialization: string;
  isFlagged: boolean; // Flagged for high-risk monitoring
  linkedAt: Date;
}

const DoctorPatientLinkSchema: Schema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  specialization: { type: String, default: 'General Physician' },
  isFlagged: { type: Boolean, default: false },
  linkedAt: { type: Date, default: Date.now },
});

// Avoid duplicate doctor-patient links
DoctorPatientLinkSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

export default mongoose.model<IDoctorPatientLink>('DoctorPatientLink', DoctorPatientLinkSchema);
