const mongoose = require("mongoose");

const doctorVerificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // One active application per user
  },
  documents: [{ 
    type: String, 
    required: true // Array of Cloudinary URLs
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  feedback: {
    type: String // Reason for rejection
  }
}, { timestamps: true });

module.exports = mongoose.model("DoctorVerification", doctorVerificationSchema);
