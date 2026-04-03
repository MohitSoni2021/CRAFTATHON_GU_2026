import { Schema, model, Document, Types } from "mongoose";

/**
 * Interface representing a CaregiverLink document in Mongoose.
 * Links a patient to their caregiver.
 */
export interface ICaregiverLink extends Document {
  patientId: Types.ObjectId;
  caregiverId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const caregiverLinkSchema = new Schema<ICaregiverLink>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    caregiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// High-performance unique compound index to prevent duplicate linkages
caregiverLinkSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

export const CaregiverLink = model<ICaregiverLink>("CaregiverLink", caregiverLinkSchema);
