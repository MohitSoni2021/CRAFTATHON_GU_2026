const DoctorReport = require("../models/DoctorReport");
const User = require("../models/User");

// Create a new doctor report
exports.createDoctorReport = async (req, res) => {
  try {
    const { userId, visitDate, doctorName, diagnosis, prescriptions, summary, fileUrl, followUpDate } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doctorReport = new DoctorReport({
      userId,
      visitDate: new Date(visitDate),
      doctorName,
      diagnosis,
      prescriptions,
      summary,
      fileUrl,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    await doctorReport.save();
    res.status(201).json({
      message: "Doctor report created successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor report", error: error.message });
  }
};

// Get all doctor reports for a user
exports.getDoctorReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId };

    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const doctorReports = await DoctorReport.find(query).sort({ visitDate: -1 });

    res.status(200).json({
      message: "Doctor reports retrieved successfully",
      count: doctorReports.length,
      data: doctorReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctor reports", error: error.message });
  }
};

// Get a specific doctor report by ID
exports.getDoctorReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctorReport = await DoctorReport.findById(id).populate("userId", "name email");
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    res.status(200).json({
      message: "Doctor report retrieved successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctor report", error: error.message });
  }
};

// Update a doctor report
exports.updateDoctorReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date fields if present
    if (updateData.visitDate) updateData.visitDate = new Date(updateData.visitDate);
    if (updateData.followUpDate) updateData.followUpDate = new Date(updateData.followUpDate);

    const doctorReport = await DoctorReport.findByIdAndUpdate(id, updateData, { new: true });
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    res.status(200).json({
      message: "Doctor report updated successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor report", error: error.message });
  }
};

// Delete a doctor report
exports.deleteDoctorReport = async (req, res) => {
  try {
    const { id } = req.params;

    const doctorReport = await DoctorReport.findByIdAndDelete(id);
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    res.status(200).json({
      message: "Doctor report deleted successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor report", error: error.message });
  }
};

// Add a prescription to a doctor report
exports.addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { prescription } = req.body;

    const doctorReport = await DoctorReport.findById(id);
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    doctorReport.prescriptions.push(prescription);
    await doctorReport.save();

    res.status(200).json({
      message: "Prescription added successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding prescription", error: error.message });
  }
};

// Update a specific prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { id, prescriptionId } = req.params;
    const updateData = req.body;

    const doctorReport = await DoctorReport.findById(id);
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    const prescription = doctorReport.prescriptions.id(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    Object.assign(prescription, updateData);
    await doctorReport.save();

    res.status(200).json({
      message: "Prescription updated successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating prescription", error: error.message });
  }
};

// Delete a specific prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id, prescriptionId } = req.params;

    const doctorReport = await DoctorReport.findById(id);
    if (!doctorReport) {
      return res.status(404).json({ message: "Doctor report not found" });
    }

    doctorReport.prescriptions.id(prescriptionId).deleteOne();
    await doctorReport.save();

    res.status(200).json({
      message: "Prescription deleted successfully",
      data: doctorReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting prescription", error: error.message });
  }
};

// Get doctor reports by doctor name
exports.getDoctorReportsByDoctor = async (req, res) => {
  try {
    const { userId, doctorName } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doctorReports = await DoctorReport.find({ userId, doctorName }).sort({ visitDate: -1 });

    res.status(200).json({
      message: `Doctor reports from Dr. ${doctorName} retrieved successfully`,
      count: doctorReports.length,
      data: doctorReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctor reports", error: error.message });
  }
};

// Get doctor reports by diagnosis
exports.getDoctorReportsByDiagnosis = async (req, res) => {
  try {
    const { userId, diagnosis } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doctorReports = await DoctorReport.find({ userId, diagnosis }).sort({ visitDate: -1 });

    res.status(200).json({
      message: `Doctor reports with diagnosis '${diagnosis}' retrieved successfully`,
      count: doctorReports.length,
      data: doctorReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctor reports", error: error.message });
  }
};

// Get pending follow-ups for a user
exports.getPendingFollowUps = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctorReports = await DoctorReport.find({
      userId,
      followUpDate: { $gte: today }
    }).sort({ followUpDate: 1 });

    res.status(200).json({
      message: "Pending follow-ups retrieved successfully",
      count: doctorReports.length,
      data: doctorReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving follow-ups", error: error.message });
  }
};

// Search doctor reports
exports.searchDoctorReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { doctorName, diagnosis, startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId };

    if (doctorName) {
      query.doctorName = { $regex: doctorName, $options: "i" };
    }

    if (diagnosis) {
      query.diagnosis = diagnosis;
    }

    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const doctorReports = await DoctorReport.find(query).sort({ visitDate: -1 });

    res.status(200).json({
      message: "Doctor reports retrieved successfully",
      count: doctorReports.length,
      data: doctorReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctor reports", error: error.message });
  }
};
