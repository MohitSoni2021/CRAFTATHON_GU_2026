const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  rawText: { type: String }, // original user input (optional)
  summary: { type: String, required: true }, // AI-generated summary
  mood: { 
    type: String, 
    enum: ['happy', 'neutral', 'stressed', 'sad', 'anxious', 'energetic']
  },
  tags: [{ type: String }] // AI-extracted: e.g., ["exercise", "diet", "sleep", "work"]
}, {
  timestamps: true
});

diarySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Diary', diarySchema);
