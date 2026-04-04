const express = require("express");
const diaryController = require("./diaryController");

const router = express.Router();

// Create a new diary entry
router.post("/", diaryController.createDiaryEntry);

// Get all diary entries for a user
router.get("/user/:userId", diaryController.getDiaryEntries);

// Get diary entries by mood
router.get("/user/:userId/mood/:mood", diaryController.getDiaryEntriesByMood);

// Get diary entries by tag
router.get("/user/:userId/tag/:tag", diaryController.getDiaryEntriesByTag);

// Get mood statistics for a user
router.get("/user/:userId/stats/mood", diaryController.getMoodStatistics);

// Get a specific diary entry by ID
router.get("/:id", diaryController.getDiaryEntryById);

// Update a diary entry
router.put("/:id", diaryController.updateDiaryEntry);

// Delete a diary entry
router.delete("/:id", diaryController.deleteDiaryEntry);

module.exports = router;
