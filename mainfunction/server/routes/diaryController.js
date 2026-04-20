const Diary = require("../models/Diary");
const User = require("../models/User");

// Create a new diary entry
exports.createDiaryEntry = async (req, res) => {
  try {
    const { userId, date, rawText, summary, mood, tags } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const diaryEntry = new Diary({
      userId,
      date: new Date(date),
      rawText,
      summary,
      mood,
      tags
    });

    await diaryEntry.save();
    res.status(201).json({
      message: "Diary entry created successfully",
      data: diaryEntry
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating diary entry", error: error.message });
  }
};

// Get all diary entries for a user
exports.getDiaryEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const diaryEntries = await Diary.find(query).sort({ date: -1 });

    res.status(200).json({
      message: "Diary entries retrieved successfully",
      count: diaryEntries.length,
      data: diaryEntries
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving diary entries", error: error.message });
  }
};

// Get a specific diary entry by ID
exports.getDiaryEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const diaryEntry = await Diary.findById(id).populate("userId", "name email");
    if (!diaryEntry) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(200).json({
      message: "Diary entry retrieved successfully",
      data: diaryEntry
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving diary entry", error: error.message });
  }
};

// Update a diary entry
exports.updateDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const diaryEntry = await Diary.findByIdAndUpdate(id, updateData, { new: true });
    if (!diaryEntry) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(200).json({
      message: "Diary entry updated successfully",
      data: diaryEntry
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating diary entry", error: error.message });
  }
};

// Delete a diary entry
exports.deleteDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const diaryEntry = await Diary.findByIdAndDelete(id);
    if (!diaryEntry) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(200).json({
      message: "Diary entry deleted successfully",
      data: diaryEntry
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting diary entry", error: error.message });
  }
};

// Get diary entries by mood
exports.getDiaryEntriesByMood = async (req, res) => {
  try {
    const { userId, mood } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId, mood };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const diaryEntries = await Diary.find(query).sort({ date: -1 });

    res.status(200).json({
      message: `Diary entries with mood '${mood}' retrieved successfully`,
      count: diaryEntries.length,
      data: diaryEntries
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving diary entries", error: error.message });
  }
};

// Get diary entries by tag
exports.getDiaryEntriesByTag = async (req, res) => {
  try {
    const { userId, tag } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId, tags: tag };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const diaryEntries = await Diary.find(query).sort({ date: -1 });

    res.status(200).json({
      message: `Diary entries with tag '${tag}' retrieved successfully`,
      count: diaryEntries.length,
      data: diaryEntries
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving diary entries", error: error.message });
  }
};

// Get mood statistics for a user
exports.getMoodStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const moodStats = await Diary.aggregate([
      { $match: query },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      message: "Mood statistics retrieved successfully",
      data: moodStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving mood statistics", error: error.message });
  }
};
