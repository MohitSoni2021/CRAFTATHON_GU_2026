const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Get AI Usage Stats
exports.getAIStats = async (req, res) => {
    try {
        const totalConsultations = await Consultation.countDocuments();

        const tokenStats = await Consultation.aggregate([
            {
                $group: {
                    _id: null,
                    totalPromptTokens: { $sum: "$tokenUsage.promptTokens" },
                    totalCompletionTokens: { $sum: "$tokenUsage.completionTokens" },
                    totalTokens: { $sum: "$tokenUsage.totalTokens" }
                }
            }
        ]);

        const stats = tokenStats[0] || { totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0 };

        // Cost Estimation: $0.35 per 1M tokens (Gemini Flash Input) / $1.05 per 1M output approx or generic
        // Let's assume generic avg $0.50 per 1M for simplicity in this demo
        const estimatedCostUSD = (stats.totalTokens / 1000000) * 0.50;
        const estimatedCostINR = estimatedCostUSD * 86; // Approx exchange rate

        res.json({
            totalConsultations,
            totalTokens: stats.totalTokens,
            estimatedCostUSD: estimatedCostUSD.toFixed(4),
            estimatedCostINR: estimatedCostINR.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching AI stats', error: error.message });
    }
};

// Get Recent AI Consultations Logs
exports.getAIConsultations = async (req, res) => {
    try {
        const logs = await Consultation.find()
            .sort({ date: -1 })
            .limit(20)
            .populate('user', 'name email');

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching AI logs', error: error.message });
    }
};
