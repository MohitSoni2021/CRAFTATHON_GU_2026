const express = require('express');
const router = express.Router();
const { requestMeeting, getPendingRequests, approveMeeting, getUpcomingMeetings, summarizeMeeting } = require('../controllers/meetingController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temp storage

// Middleware for Admin check
const adminCheck = (req, res, next) => {
    if (req.user && req.user.type === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
};

// Middleware for Doctor check
const doctorCheck = (req, res, next) => {
    if (req.user && (req.user.type === 'doctor' || req.user.type === 'admin')) {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Doctors only.' });
    }
};

router.post('/request', auth, doctorCheck, requestMeeting);
router.get('/pending', auth, adminCheck, getPendingRequests);
router.put('/approve/:id', auth, adminCheck, approveMeeting);
router.get('/upcoming', auth, doctorCheck, getUpcomingMeetings);
router.post('/summarize/:id', auth, adminCheck, upload.single('recording'), summarizeMeeting);

module.exports = router;
