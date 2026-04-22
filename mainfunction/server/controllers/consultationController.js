const Consultation = require('../models/Consultation');
const { sendConsultationResult } = require('../utils/emailService');
const User = require('../models/User');

// @desc    Request a doctor review for a consultation
// @route   PUT /api/consultation/:id/request-review
// @access  Private (Patient)
exports.requestReview = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        // Ensure user owns the consultation
        if (consultation.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        consultation.reviewStatus = 'pending';
        await consultation.save();

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        console.error('Error requesting review:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all pending reviews (for Doctors)
// @route   GET /api/consultation/pending-reviews
// @access  Private (Doctor/Admin)
exports.getPendingReviews = async (req, res) => {
    try {
        // ideally checking if req.user.type is 'doctor' or 'admin'
        // Assuming auth middleware handles basic auth, we check role here or in route middleware

        const consultations = await Consultation.find({ reviewStatus: 'pending' })
            .populate('user', 'name email profile') // Get patient details
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: consultations.length, data: consultations });
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Submit a review (Doctor)
// @route   PUT /api/consultation/:id/review
// @access  Private (Doctor)
exports.submitReview = async (req, res) => {
    try {
        const { doctorNotes } = req.body;
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        consultation.reviewStatus = 'reviewed';
        consultation.reviewedBy = req.user.id;
        consultation.doctorNotes = doctorNotes;
        consultation.reviewDate = Date.now();

        await consultation.save();

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user's consultation history
// @route   GET /api/consultation/history
// @access  Private
exports.getUserConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ user: req.user.id })
            .sort({ date: -1 }); // Newest first

        res.status(200).json({ success: true, count: consultations.length, data: consultations });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
