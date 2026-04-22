const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const auth = require('../middleware/authMiddleware');

// Route for top medicines
router.get('/top', auth, medicineController.getTopMedicines);

// Route for searching medicines
router.get('/search', auth, medicineController.searchMedicines);

// Route for autocomplete suggestions
router.get('/suggest', auth, medicineController.getSuggestions);

// Route for medicine details
router.get('/details/:id', auth, medicineController.getMedicineDetails);

module.exports = router;
