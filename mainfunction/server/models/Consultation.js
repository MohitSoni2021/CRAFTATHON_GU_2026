const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    aiSummary: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    actions: [{
        type: String
    }],
    lifestyleAdvice: [{
        type: String
    }],
    suggestedMedicines: [{
        type: String
    }],
    language: {
        type: String,
        default: 'en'
    },
    date: {
        type: Date,
        default: Date.now
    },
    tokenUsage: {
        promptTokens: { type: Number, default: 0 },
        completionTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 }
    },
    // Expert Review Fields
    reviewStatus: {
        type: String,
        enum: ['none', 'pending', 'reviewed'],
        default: 'none'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctorNotes: {
        type: String
    },
    reviewDate: {
        type: Date
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);
