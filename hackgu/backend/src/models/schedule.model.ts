import { Schema, model, Document, Types } from "mongoose";
import { FrequencyType } from "@hackgu/shared";

/**
 * Interface representing a MedicationSchedule document in Mongoose.
 */
export interface IMedicationSchedule extends Document {
  medicationId: Types.ObjectId;
  time: string; // HH:mm format
  frequencyType: FrequencyType;
  daysOfWeek?: number[]; // Array of numbers (0-6)
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<IMedicationSchedule>(
  {
    medicationId: { type: Schema.Types.ObjectId, ref: "Medication", required: true, index: true },
    time: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid time format (HH:mm)`
      }
    },
    frequencyType: { 
      type: String, 
      enum: Object.values(FrequencyType), 
      required: true 
    },
    daysOfWeek: { 
      type: [Number],
      validate: {
        validator: function(v: number[]) {
          return v.every(day => day >= 0 && day <= 6);
        },
        message: "Days of week must be between 0 (Sunday) and 6 (Saturday)"
      }
    },
  },
  { timestamps: true }
);

// Performance index for lookup by medication
scheduleSchema.index({ medicationId: 1 });

export const MedicationSchedule = model<IMedicationSchedule>("MedicationSchedule", scheduleSchema);
