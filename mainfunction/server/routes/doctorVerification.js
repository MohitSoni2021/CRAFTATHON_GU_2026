const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/doctorVerificationController");

// User Routes
router.post("/apply", authMiddleware, upload.array('documents', 5), controller.applyForVerification);
router.get("/status", authMiddleware, controller.getApplicationStatus);

// Admin Routes (Should technically have an 'adminMiddleware' check, checking if req.user.type === 'admin')
// For now, we assume the protected route + checking type in frontend/controller or if authMiddleware adds user info.
// We'll add a check here for safety.
const adminCheck = (req, res, next) => {
    if (req.user && req.user.type === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};

router.get("/admin/pending", authMiddleware, adminCheck, controller.getAllPendingApplications);
router.put("/admin/review/:id", authMiddleware, adminCheck, controller.reviewApplication);

module.exports = router;
