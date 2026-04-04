const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sosContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { type: String }
});

const emergencySettingsSchema = new mongoose.Schema({
  enableAutoAlert: { type: Boolean, default: false },
  criticalThresholds: {
    glucose: { low: Number, high: Number },
    bloodPressure: {
      systolicHigh: Number,
      diastolicHigh: Number
    }
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  profileImage: { type: String },
  isManaged: { type: Boolean, default: false }, // For dependent accounts (e.g., elderly parents, children)


  // New health profile fields
  profile: {
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bloodGroup: { type: String },
    chronicConditions: [{ type: String }], // e.g., ["diabetes", "hypertension"]
    storyDesc: { type: String } // AI generated summary of user's lifestyle
  },

  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due'], default: 'active' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  },

  usage: {
    aiConsultations: { type: Number, default: 0 },
    ocrScans: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },

  sosContacts: [sosContactSchema],

  availability: {
    days: [{ type: String }], // Mon, Tue, Wed, nm...
    workingHours: {
      start: { type: String }, // e.g., "09:00"
      end: { type: String }    // e.g., "17:00"
    },
    lunchBreak: {
      start: { type: String }, // e.g., "13:00"
      end: { type: String }    // e.g., "14:00"
    },
    slotDuration: { type: Number, default: 30 } // in minutes
  },

  emergencySettings: emergencySettingsSchema

}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
