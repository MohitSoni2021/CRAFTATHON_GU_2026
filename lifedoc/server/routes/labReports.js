const express = require("express");
const labReportController = require("./labReportController");

const router = express.Router();

// Create a new lab report
router.post("/", labReportController.createLabReport);

// Get all lab reports for a user
router.get("/user/:userId", labReportController.getLabReports);

// Get latest lab reports by test type for a user
router.get("/user/:userId/latest", labReportController.getLatestLabReportsByTestType);

// Search lab reports for a user
router.get("/user/:userId/search", labReportController.searchLabReports);

// Get lab reports by test type
router.get("/user/:userId/test-type/:testType", labReportController.getLabReportsByTestType);

// Get a specific lab report by ID
router.get("/:id", labReportController.getLabReportById);

// Update a lab report
router.put("/:id", labReportController.updateLabReport);

// Delete a lab report
router.delete("/:id", labReportController.deleteLabReport);

module.exports = router;
