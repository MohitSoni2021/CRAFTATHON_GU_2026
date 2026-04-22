const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/medicationReminderController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, reminderController.createReminder);
router.get('/', auth, reminderController.getReminders);
router.patch('/:id', auth, reminderController.updateReminder);
router.delete('/:id', auth, reminderController.deleteReminder);
router.post('/:id/mark-taken', auth, reminderController.markAsTaken);

module.exports = router;
