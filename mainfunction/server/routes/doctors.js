const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware'); // Corrected import

// Get all doctors
// Using authMiddleware to ensure only logged-in users can see doctors list
router.get('/', authMiddleware, doctorController.getAllDoctors);

router.put('/availability', authMiddleware, doctorController.updateAvailability);
router.get('/:id/slots', authMiddleware, doctorController.getDoctorSlots);
router.get('/:id', authMiddleware, doctorController.getDoctorById);

module.exports = router;
