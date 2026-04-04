import mongoose, { Schema, Document } from 'mongoose';

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { timestamps: true }
);

// One subscription per user (upsert on subscribe)
PushSubscriptionSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
