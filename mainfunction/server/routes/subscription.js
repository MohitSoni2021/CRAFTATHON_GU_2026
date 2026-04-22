const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

// Helper wrapper to catch async errors if not using express-async-handler
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Create checkout session
router.post('/create-checkout-session', protect, asyncHandler(subscriptionController.createCheckoutSession));

// Get subscription status
router.get('/status', protect, asyncHandler(subscriptionController.getSubscriptionStatus));

// Webhook (Does not need auth protection, but needs to be public)
// Note: In production, this should be mounted BEFORE body-parser if verifying signatures strictly with raw body
router.post('/webhook', asyncHandler(subscriptionController.handleWebhook));

module.exports = router;
