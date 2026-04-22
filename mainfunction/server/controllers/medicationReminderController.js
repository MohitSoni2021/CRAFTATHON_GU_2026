const MedicationReminder = require('../models/MedicationReminder');

exports.createReminder = async (req, res) => {
  try {
    const { medicineName, medicineImage, dosage, frequencyPerDay, frequencyType, times } = req.body;
    
    if (!medicineName && !medicineImage) {
      return res.status(400).json({ message: "Medicine name or image is required" });
    }

    const newReminder = new MedicationReminder({
      userId: req.user.id,
      medicineName,
      medicineImage,
      dosage,
      frequencyPerDay: frequencyPerDay || 1,
      frequencyType,
      times
    });

    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await MedicationReminder.find({ userId: req.user.id, isActive: true });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsTaken = async (req, res) => {
  try {
    const { time, status } = req.body; // status: 'taken' or 'snoozed'
    const reminder = await MedicationReminder.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.takenLog.push({
      date: new Date(),
      time,
      status: status || 'taken'
    });

    await reminder.save();
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
