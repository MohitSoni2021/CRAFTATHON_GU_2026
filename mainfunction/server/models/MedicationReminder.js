const mongoose = require('mongoose');

const MedicationReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineName: {
    type: String,
    required: function() { return !this.medicineImage; }
  },
  medicineImage: {
    type: String,
    required: function() { return !this.medicineName; }
  },
  dosage: {
    type: String,
    required: true
  },
  frequencyPerDay: {
    type: Number,
    default: 1
  },
  frequencyType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  times: [{
    type: String, // HH:mm format
    required: true
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  takenLog: [{
    date: { type: Date, default: Date.now },
    time: String,
    status: {
      type: String,
      enum: ['taken', 'snoozed', 'missed'],
      default: 'taken'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('MedicationReminder', MedicationReminderSchema);
