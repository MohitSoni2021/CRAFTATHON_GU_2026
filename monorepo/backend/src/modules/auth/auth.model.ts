import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserRoleValues } from '@hackgu/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  timezone: string;
  adherenceScore?: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: UserRoleValues, default: UserRole.PATIENT },
  phone: { type: String, required: false },
  timezone: { type: String, default: "Asia/Kolkata" },
  adherenceScore: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
