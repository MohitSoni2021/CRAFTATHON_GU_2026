const express = require('express');
const router = express.Router();
const { requestReview, getPendingReviews, submitReview, getUserConsultations } = require('../controllers/consultationController');
const auth = require('../middleware/authMiddleware');

// Middleware to check if user is a doctor
const doctorCheck = (req, res, next) => {
    if (req.user && (req.user.type === 'doctor' || req.user.type === 'admin')) {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Doctors only.' });
    }
};

// Routes
router.put('/:id/request-review', auth, requestReview);
router.get('/history', auth, getUserConsultations);
router.get('/pending-reviews', auth, doctorCheck, getPendingReviews);
router.put('/:id/review', auth, doctorCheck, submitReview);

module.exports = router;
