const mongoose = require('mongoose');

const MeetingRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Normal', 'Urgent', 'Critical'],
        default: 'Normal'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    meetingLink: {
        type: String
    },
    scheduledAt: {
        type: Date
    },
    duration: {
        type: Number,
        default: 60 // Minutes
    },
    summary: {
        type: String
    },
    recordingLink: { // New: Optional link to full video (e.g. Drive)
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MeetingRequest', MeetingRequestSchema);
