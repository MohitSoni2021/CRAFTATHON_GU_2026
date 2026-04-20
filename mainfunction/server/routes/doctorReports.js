const express = require("express");
const doctorReportController = require("./doctorReportController");

const router = express.Router();

// Create a new doctor report
router.post("/", doctorReportController.createDoctorReport);

// Get all doctor reports for a user
router.get("/user/:userId", doctorReportController.getDoctorReports);

// Get pending follow-ups for a user
router.get("/user/:userId/follow-ups", doctorReportController.getPendingFollowUps);

// Search doctor reports
router.get("/user/:userId/search", doctorReportController.searchDoctorReports);

// Get doctor reports by doctor name
router.get("/user/:userId/doctor/:doctorName", doctorReportController.getDoctorReportsByDoctor);

// Get doctor reports by diagnosis
router.get("/user/:userId/diagnosis/:diagnosis", doctorReportController.getDoctorReportsByDiagnosis);

// Get a specific doctor report by ID
router.get("/:id", doctorReportController.getDoctorReportById);

// Update a doctor report
router.put("/:id", doctorReportController.updateDoctorReport);

// Add a prescription to a doctor report
router.post("/:id/prescription", doctorReportController.addPrescription);

// Update a specific prescription
router.put("/:id/prescription/:prescriptionId", doctorReportController.updatePrescription);

// Delete a specific prescription
router.delete("/:id/prescription/:prescriptionId", doctorReportController.deletePrescription);

// Delete a doctor report
router.delete("/:id", doctorReportController.deleteDoctorReport);

module.exports = router;
