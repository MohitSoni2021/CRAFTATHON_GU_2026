import { Schema, model, Document } from "mongoose";
import { Role } from "@hackgu/shared";

/**
 * Interface representing a User document in Mongoose.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    password: { type: String, select: false },
    role: { 
      type: String, 
      enum: Object.values(Role), 
      default: Role.PATIENT,
      required: true 
    },
  },
  { timestamps: true }
);

// High-performance index for email
userSchema.index({ email: 1 }, { unique: true });

export const User = model<IUser>("User", userSchema);
