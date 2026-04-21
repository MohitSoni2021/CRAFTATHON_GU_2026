const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// ─────────────────────────────────────────────
// Public: Seed Admin (dev only – remove in production)
// POST /api/admin/seed
// ─────────────────────────────────────────────
router.post('/seed', adminController.createAdminUser);

// ─────────────────────────────────────────────
// All routes below are protected: Auth + Admin
// ─────────────────────────────────────────────
router.use(authMiddleware);
router.use(verifyAdmin);

// Stats
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/subscription', adminController.toggleSubscription);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
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
