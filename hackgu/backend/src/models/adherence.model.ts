import { Schema, model, Document, Types } from "mongoose";

/**
 * Interface representing an AdherenceReport document in Mongoose.
 */
export interface IAdherenceReport extends Document {
  userId: Types.ObjectId;
  date: string; // ISO-8601 date string (YYYY-MM-DD)
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherencePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const adherenceSchema = new Schema<IAdherenceReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    totalDoses: { type: Number, required: true, default: 0 },
    takenDoses: { type: Number, required: true, default: 0 },
    missedDoses: { type: Number, required: true, default: 0 },
    adherencePercentage: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Performance index for searching reports by user and date
adherenceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AdherenceReport = model<IAdherenceReport>("AdherenceReport", adherenceSchema);
