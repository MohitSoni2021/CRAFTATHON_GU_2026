import { Schema, model, Document, Types } from "mongoose";

/**
 * Interface representing a Medication document in Mongoose.
 */
export interface IMedication extends Document {
  userId: Types.ObjectId;
  name: string;
  dosage: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const medicationSchema = new Schema<IMedication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },
    instructions: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

// Performance index for searching by user
medicationSchema.index({ userId: 1 });

export const Medication = model<IMedication>("Medication", medicationSchema);
