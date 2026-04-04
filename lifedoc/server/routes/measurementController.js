const Measurement = require("../models/Measurement");
const User = require("../models/User");

// Create a new measurement reading
exports.createMeasurement = async (req, res) => {
  try {
    const { userId, date, readings } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if measurement for this date already exists
    let measurement = await Measurement.findOne({ userId, date: new Date(date) });

    if (measurement) {
      // Add readings to existing measurement
      measurement.readings.push(...readings);
    } else {
      // Create new measurement
      measurement = new Measurement({
        userId,
        date: new Date(date),
        readings
      });
    }

    await measurement.save();
    res.status(201).json({
      message: "Measurement recorded successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating measurement", error: error.message });
  }
};

// Get measurements for a user
exports.getMeasurements = async (req, res) => {
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
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const measurements = await Measurement.find(query).sort({ date: -1 });

    res.status(200).json({
      message: "Measurements retrieved successfully",
      data: measurements
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving measurements", error: error.message });
  }
};

// Get a specific measurement by ID
exports.getMeasurementById = async (req, res) => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findById(id).populate("userId", "name email");
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    res.status(200).json({
      message: "Measurement retrieved successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving measurement", error: error.message });
  }
};

// Add a reading to an existing measurement
exports.addReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { reading } = req.body;

    const measurement = await Measurement.findById(id);
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    measurement.readings.push(reading);
    await measurement.save();

    res.status(200).json({
      message: "Reading added successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding reading", error: error.message });
  }
};

// Update a specific reading
exports.updateReading = async (req, res) => {
  try {
    const { id, readingId } = req.params;
    const updateData = req.body;

    const measurement = await Measurement.findById(id);
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    const reading = measurement.readings.id(readingId);
    if (!reading) {
      return res.status(404).json({ message: "Reading not found" });
    }

    Object.assign(reading, updateData);
    await measurement.save();

    res.status(200).json({
      message: "Reading updated successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating reading", error: error.message });
  }
};

// Delete a measurement
exports.deleteMeasurement = async (req, res) => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findByIdAndDelete(id);
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    res.status(200).json({
      message: "Measurement deleted successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting measurement", error: error.message });
  }
};

// Delete a specific reading
exports.deleteReading = async (req, res) => {
  try {
    const { id, readingId } = req.params;

    const measurement = await Measurement.findById(id);
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    measurement.readings.id(readingId).deleteOne();
    await measurement.save();

    res.status(200).json({
      message: "Reading deleted successfully",
      data: measurement
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reading", error: error.message });
  }
};

// Get measurements by type for a user
exports.getMeasurementsByType = async (req, res) => {
  try {
    const { userId, type } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    let query = { userId, "readings.type": type };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const measurements = await Measurement.find(query).sort({ date: -1 });

    res.status(200).json({
      message: `${type} measurements retrieved successfully`,
      data: measurements
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving measurements", error: error.message });
  }
};
