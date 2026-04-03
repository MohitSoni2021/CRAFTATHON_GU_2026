import { Schema, model, Document, Types } from "mongoose";
import { DoseStatus } from "@hackgu/shared";

/**
 * Interface representing a DoseLog document in Mongoose.
 */
export interface IDoseLog extends Document {
  medicationId: Types.ObjectId;
  scheduledTime: Date;
  takenTime?: Date;
  status: DoseStatus;
  delayMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const doseLogSchema = new Schema<IDoseLog>(
  {
    medicationId: { type: Schema.Types.ObjectId, ref: "Medication", required: true, index: true },
    scheduledTime: { type: Date, required: true, index: true },
    takenTime: { type: Date },
    status: { 
      type: String, 
      enum: Object.values(DoseStatus), 
      required: true,
      index: true 
    },
    delayMinutes: { type: Number, min: 0 }
  },
  { timestamps: true }
);

// Performance compound index for filtering/reporting
doseLogSchema.index({ medicationId: 1, scheduledTime: 1, status: 1 });

export const DoseLog = model<IDoseLog>("DoseLog", doseLogSchema);
