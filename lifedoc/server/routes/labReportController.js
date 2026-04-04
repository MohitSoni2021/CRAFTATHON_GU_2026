const LabReport = require("../models/LabReport");
const User = require("../models/User");

// Create a new lab report
exports.createLabReport = async (req, res) => {
  try {
    const { userId, reportDate, testType, parsedResults, fileUrl, notes } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const labReport = new LabReport({
      userId,
      reportDate: new Date(reportDate),
      testType,
      parsedResults,
      fileUrl,
      notes
    });

    await labReport.save();
    res.status(201).json({
      message: "Lab report created successfully",
      data: labReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating lab report", error: error.message });
  }
};

// Get all lab reports for a user
exports.getLabReports = async (req, res) => {
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
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const labReports = await LabReport.find(query).sort({ reportDate: -1 });

    res.status(200).json({
      message: "Lab reports retrieved successfully",
      count: labReports.length,
      data: labReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lab reports", error: error.message });
  }
};

// Get a specific lab report by ID
exports.getLabReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const labReport = await LabReport.findById(id).populate("userId", "name email");
    if (!labReport) {
      return res.status(404).json({ message: "Lab report not found" });
    }

    res.status(200).json({
      message: "Lab report retrieved successfully",
      data: labReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lab report", error: error.message });
  }
};

// Update a lab report
exports.updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const labReport = await LabReport.findByIdAndUpdate(id, updateData, { new: true });
    if (!labReport) {
      return res.status(404).json({ message: "Lab report not found" });
    }

    res.status(200).json({
      message: "Lab report updated successfully",
      data: labReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating lab report", error: error.message });
  }
};

// Delete a lab report
exports.deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;

    const labReport = await LabReport.findByIdAndDelete(id);
    if (!labReport) {
      return res.status(404).json({ message: "Lab report not found" });
    }

    res.status(200).json({
      message: "Lab report deleted successfully",
      data: labReport
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lab report", error: error.message });
  }
};

// Get lab reports by test type
exports.getLabReportsByTestType = async (req, res) => {
  try {
    const { userId, testType } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId, testType };

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const labReports = await LabReport.find(query).sort({ reportDate: -1 });

    res.status(200).json({
      message: `Lab reports with test type '${testType}' retrieved successfully`,
      count: labReports.length,
      data: labReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lab reports", error: error.message });
  }
};

// Get latest lab report for each test type
exports.getLatestLabReportsByTestType = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const latestReports = await LabReport.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
      { $sort: { reportDate: -1 } },
      { $group: { 
          _id: "$testType", 
          latestReport: { $first: "$$ROOT" } 
        } 
      },
      { $replaceRoot: { newRoot: "$latestReport" } }
    ]);

    res.status(200).json({
      message: "Latest lab reports retrieved successfully",
      count: latestReports.length,
      data: latestReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lab reports", error: error.message });
  }
};

// Search lab reports by test type
exports.searchLabReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { testType, startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId };

    if (testType) {
      query.testType = { $regex: testType, $options: "i" }; // case-insensitive search
    }

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const labReports = await LabReport.find(query).sort({ reportDate: -1 });

    res.status(200).json({
      message: "Lab reports retrieved successfully",
      count: labReports.length,
      data: labReports
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving lab reports", error: error.message });
  }
};
