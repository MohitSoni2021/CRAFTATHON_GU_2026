const mongoose = require("mongoose");

const measurementReadingSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['glucose', 'bloodPressure', 'weight', 'heartRate', 'spo2', 'other']
  },
  timestamp: { type: Date, default: Date.now },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, 
  // Examples:
  // glucose: 120 (Number)
  // bloodPressure: { systolic: 120, diastolic: 80 }
  // weight: 70.5
  unit: { type: String }, // e.g., "mg/dL", "mmHg", "kg"
  notes: { type: String } // e.g., "fasting", "after meal", "stressed"
});

const measurementsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true }, // date without time (e.g., 2025-12-26)
  readings: [measurementReadingSchema]
}, {
  timestamps: true
});

// Compound index for fast queries
measurementsSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Measurement', measurementsSchema);
