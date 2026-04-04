const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All routes here are protected by Auth AND Admin middleware
router.use(authMiddleware);
router.use(verifyAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Medical Database Routes
const adminMedicalController = require('../controllers/adminMedicalController');
router.get('/medicines', adminMedicalController.getMedicines);
router.post('/medicines', adminMedicalController.addMedicine);
router.put('/medicines/:id', adminMedicalController.updateMedicine);
router.delete('/medicines/:id', adminMedicalController.deleteMedicine);

router.get('/lab-tests', adminMedicalController.getLabTests);
router.post('/lab-tests', adminMedicalController.addLabTest);
router.put('/lab-tests/:id', adminMedicalController.updateLabTest);

// AI Monitoring Routes
const adminAIController = require('../controllers/adminAIController');
router.get('/ai/stats', adminAIController.getAIStats);
router.get('/ai/logs', adminAIController.getAIConsultations);

module.exports = router;
