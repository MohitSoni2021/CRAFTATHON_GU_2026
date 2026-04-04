const DoctorVerification = require("../models/DoctorVerification");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinaryConfig");
const { sendVerificationStatus } = require("../utils/emailService");

// User: Apply for verification
exports.applyForVerification = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user already has a pending or approved application
        const existing = await DoctorVerification.findOne({ userId });
        if (existing && existing.status === 'pending') {
            return res.status(400).json({ message: "You already have a pending application." });
        }
        if (existing && existing.status === 'approved') {
            return res.status(400).json({ message: "You are already a verified doctor." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please upload verification documents." });
        }

        // Upload files to Cloudinary
        const documentUrls = [];
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = "data:" + file.mimetype + ";base64," + b64;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "doctor_verification",
                resource_type: "auto"
            });
            documentUrls.push(result.secure_url);
        }

        // Create or Update application
        if (existing && existing.status === 'rejected') {
            // Re-apply
            existing.status = 'pending';
            existing.documents = documentUrls;
            existing.feedback = ""; // Clear old feedback
            await existing.save();
            return res.status(200).json({ message: "Application re-submitted successfully.", application: existing });
        }

        const newVerification = new DoctorVerification({
            userId,
            documents: documentUrls,
            status: 'pending'
        });

        await newVerification.save();
        res.status(201).json({ message: "Application submitted successfully.", application: newVerification });

    } catch (error) {
        console.error("Doctor Verification Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// User: Get Status
exports.getApplicationStatus = async (req, res) => {
    try {
        const application = await DoctorVerification.findOne({ userId: req.user.id });
        if (!application) {
            return res.status(404).json({ message: "No application found." });
        }
        res.status(200).json({ application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get All Pending Applications
exports.getAllPendingApplications = async (req, res) => {
    try {
        const applications = await DoctorVerification.find({ status: 'pending' })
            .populate('userId', 'name email profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json({ applications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Review Application (Approve/Reject)
exports.reviewApplication = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        const { status, feedback } = req.body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
        }

        const application = await DoctorVerification.findById(id).populate('userId', 'email name');
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        application.status = status;
        if (feedback) application.feedback = feedback;
        await application.save();

        // If Approved, update User Role
        if (status === 'approved') {
            const user = await User.findById(application.userId._id);
            if (user) {
                user.type = 'doctor';
                // You might want to set isVerified to true explicitly if not already, but usually email verification handles that.
                await user.save();
            }
        }

        // SEND EMAIL NOTIFICATION
        if (application.userId && application.userId.email) {
            await sendVerificationStatus(application.userId.email, status, feedback);
        }

        res.status(200).json({ message: `Application ${status} successfully. Email sent.`, application });

    } catch (error) {
        console.error("Review Application Error", error);
        res.status(500).json({ message: error.message });
    }
};
