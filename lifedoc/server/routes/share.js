const router = require("express").Router();
const User = require("../models/User");
const LabReport = require("../models/LabReport");
const DoctorReport = require("../models/DoctorReport");
const Measurement = require("../models/Measurement");

// GET /api/share/:userId
// Public endpoint to fetch user profile and health data
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch User Profile (exclude sensitive data like password, otp, etc.)
        const user = await User.findById(userId).select(
            "name age profile profileImage isManaged"
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Fetch Recent Lab Reports (limit 5)
        const labReports = await LabReport.find({ userId })
            .sort({ reportDate: -1 })
            .limit(5)
            .select("testType reportDate parsedResults fileUrl notes");

        // 3. Fetch Recent Doctor Reports (limit 5)
        const doctorReports = await DoctorReport.find({ userId })
            .sort({ visitDate: -1 })
            .limit(5)
            .select("doctorName visitDate diagnosis prescriptions summary fileUrl");

        // 4. Fetch Recent Measurements (limit 10)
        const measurements = await Measurement.find({ userId })
            .sort({ date: -1 })
            .limit(10)
            .select("date readings");

        res.status(200).json({
            success: true,
            data: {
                user,
                labReports,
                doctorReports,
                measurements
            }
        });

    } catch (error) {
        console.error("Error fetching shared profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
