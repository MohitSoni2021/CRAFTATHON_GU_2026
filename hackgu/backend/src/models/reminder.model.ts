import { Schema, model, Document, Types } from "mongoose";
import { ReminderType } from "@hackgu/shared";

/**
 * Interface representing a Reminder document in Mongoose.
 */
export interface IReminder extends Document {
  userId: Types.ObjectId;
  medicationId: Types.ObjectId;
  reminderTime: Date;
  type: ReminderType;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicationId: { type: Schema.Types.ObjectId, ref: "Medication", required: true, index: true },
    reminderTime: { type: Date, required: true, index: true },
    type: { 
      type: String, 
      enum: Object.values(ReminderType), 
      required: true 
    },
  },
  { timestamps: true }
);

// High-performance index for reminder worker
reminderSchema.index({ userId: 1, reminderTime: 1 });

export const Reminder = model<IReminder>("Reminder", reminderSchema);
