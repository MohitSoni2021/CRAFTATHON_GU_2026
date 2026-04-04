const User = require('../models/User');

const LIMITS = {
    consultation: 5,
    ocr: 5
};

const checkUsageLimit = (feature) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // 1. Check for Reset (Lazy Reset Logic)
            const now = new Date();
            const lastReset = new Date(user.usage.lastResetDate);
            const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

            if (daysSinceReset >= 30) {
                user.usage.aiConsultations = 0;
                user.usage.ocrScans = 0;
                user.usage.lastResetDate = now;
                await user.save();
            }

            // 2. Premium Users have no limits
            if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
                return next();
            }

            // 3. Check specific feature limit
            let currentUsage = 0;
            let limit = 0;

            if (feature === 'consultation') {
                currentUsage = user.usage.aiConsultations;
                limit = LIMITS.consultation;
            } else if (feature === 'ocr') {
                currentUsage = user.usage.ocrScans;
                limit = LIMITS.ocr;
            }

            if (currentUsage >= limit) {
                return res.status(403).json({
                    message: `Monthly limit reached for ${feature}. Upgrade to Premium for unlimited access!`,
                    isLimitReached: true,
                    limit: limit,
                    upgradeUrl: '/pricing'
                });
            }

            // 4. Attach flag to increment usage AFTER successful controller execution
            // We'll attach a method to res.locals that the controller can call, OR we can increment here?
            // Safer to increment here for "attempts", or we can define a separate "incrementUsage" middleware?
            // Let's increment HERE for simplicity - if API fails, they lose a credit. 
            // Better: Increment only if we proceed? 
            // Actually, usually we want to increment only on SUCCESS. 
            // Strategy: We'll modify the `req.user` object to have a `incrementUsage` function 
            // that controllers can call, OR we assume if they passed this middleware they WILL consume it.
            // Let's go with "Consume on Start" for simplicity in this implementation plan, 
            // OR create a helper `incrementUsage` export.

            // LET'S DO THIS: We'll expose an increment function on `req`
            req.incrementUsage = async () => {
                if (feature === 'consultation') {
                    await User.findByIdAndUpdate(req.user.id, { $inc: { 'usage.aiConsultations': 1 } });
                } else if (feature === 'ocr') {
                    await User.findByIdAndUpdate(req.user.id, { $inc: { 'usage.ocrScans': 1 } });
                }
            };

            next();

        } catch (error) {
            console.error('Usage Check Error:', error);
            res.status(500).json({ message: 'Server error checking usage limits' });
        }
    };
};

module.exports = checkUsageLimit;
