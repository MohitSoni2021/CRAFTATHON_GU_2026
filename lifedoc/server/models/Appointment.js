const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional because appointment could be with a lab
    },
    providerName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Doctor', 'Lab'],
        default: 'Doctor'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Online'
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
