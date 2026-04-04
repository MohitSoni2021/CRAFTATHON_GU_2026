const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const auth = require('../middleware/authMiddleware'); // Fixed path

// POST /api/sos/alert
router.post('/alert', auth, sosController.sendSOS);

module.exports = router;
