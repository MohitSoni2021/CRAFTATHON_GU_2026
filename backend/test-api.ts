import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI!).then(async () => {
    const User = (await import('./src/modules/auth/auth.model')).default;
    const user = await User.findOne({});
    console.log("Found user:", user?.email);
    if (user) {
        // manually create a push subscription to test cron job logic
        const PushSubscription = (await import('./src/modules/push/push-subscription.model')).default;
        await PushSubscription.findOneAndUpdate(
            { userId: user._id },
            { 
               userId: user._id, 
               endpoint: "https://fcm.googleapis.com/fcm/send/fake-endpoint",
               keys: { p256dh: "fake-p256dh", auth: "fake-auth" }
            },
            { upsert: true, new: true }
        );
        console.log("Inserted fake push subscription for user:", user._id);
    }
    process.exit(0);
});
