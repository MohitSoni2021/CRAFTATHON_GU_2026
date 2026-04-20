const express = require("express");
const measurementController = require("./measurementController");

const router = express.Router();

// Create a new measurement
router.post("/", measurementController.createMeasurement);

// Get all measurements for a user
router.get("/user/:userId", measurementController.getMeasurements);

// Get measurements by type for a user
router.get("/user/:userId/type/:type", measurementController.getMeasurementsByType);

// Get a specific measurement by ID
router.get("/:id", measurementController.getMeasurementById);

// Add a reading to an existing measurement
router.post("/:id/reading", measurementController.addReading);

// Update a specific reading
router.put("/:id/reading/:readingId", measurementController.updateReading);

// Delete a measurement
router.delete("/:id", measurementController.deleteMeasurement);

// Delete a specific reading
router.delete("/:id/reading/:readingId", measurementController.deleteReading);

module.exports = router;
