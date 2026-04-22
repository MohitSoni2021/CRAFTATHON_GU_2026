const User = require('../models/User');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ type: 'doctor' })
            .select('-password -otp -otpExpires') // Exclude sensitive info
            .sort({ name: 1 });

        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

// Get single doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id)
            .select('-password -otp -otpExpires');

        if (!doctor || doctor.type !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update doctor availability
exports.updateAvailability = async (req, res) => {
    try {
        const { days, workingHours, lunchBreak, slotDuration } = req.body;
        const doctorId = req.user.id;

        // Ensure the user is a doctor
        if (req.user.type !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Access denied: Doctors only' });
        }

        const updatedDoctor = await User.findByIdAndUpdate(
            doctorId,
            {
                $set: {
                    availability: {
                        days,
                        workingHours,
                        lunchBreak,
                        slotDuration: slotDuration || 30
                    }
                }
            },
            { new: true }
        ).select('-password -otp -otpExpires');

        res.status(200).json({ success: true, data: updatedDoctor });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ success: false, message: 'Error updating availability' });
    }
};

// Get available slots for a specific date
exports.getDoctorSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // YYYY-MM-DD

        if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

        const doctor = await User.findById(id);
        if (!doctor || doctor.type !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const { availability } = doctor;
        const requestedDate = new Date(date);
        const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if doctor works on this day
        if (!availability.days.includes(dayName)) {
            return res.status(200).json({ success: true, data: [], message: 'Doctor is not available on this day.' });
        }

        const { start, end } = availability.workingHours;
        const { start: lunchStart, end: lunchEnd } = availability.lunchBreak;
        const slotDuration = availability.slotDuration || 30;

        // Generate all possible slots
        const slots = [];
        let cleanDate = date.split('T')[0]; // Ensure just the date part if ISO is passed
        let currentTime = new Date(`${cleanDate}T${start}`);
        const endTime = new Date(`${cleanDate}T${end}`);
        const lunchStartTime = new Date(`${cleanDate}T${lunchStart}`);
        const lunchEndTime = new Date(`${cleanDate}T${lunchEnd}`);

        while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + slotDuration * 60000); // Add duration in ms

            // Check if slot is within working hours
            if (nextTime <= endTime) {
                // Check if slot overlaps with lunch break
                // Simple overlap check: (SlotStart < LunchEnd) and (SlotEnd > LunchStart)
                const isLunch = (currentTime < lunchEndTime) && (nextTime > lunchStartTime);

                if (!isLunch) {
                    const timeString = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    slots.push(timeString);
                }
            }
            currentTime = nextTime;
        }

        // Fetch existing appointments
        // Using regex to find appointments on that specific date string to avoid timezone issues with simple Date matches if not careful
        // But since we store date as Date object, let's look for range of that day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Need the Appointment model here, make sure it's imported at top if not locally used (it is imported in appointmentController, but this is doctorController)
        // Wait, doctorController doesn't import Appointment yet!
        const existingAppointments = await require('../models/Appointment').find({
            doctorId: id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        });

        const bookedTimes = existingAppointments.map(app => app.time);

        // Create slot objects with availability status
        let slotObjects = slots.map(slot => ({
            time: slot,
            available: !bookedTimes.includes(slot)
        }));

        // Filter out past slots if date is today
        const now = new Date();
        if (startOfDay.getDate() === now.getDate() && startOfDay.getMonth() === now.getMonth() && startOfDay.getFullYear() === now.getFullYear()) {
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            slotObjects = slotObjects.filter(slot => {
                const [h, m] = slot.time.split(':').map(Number);
                return h > currentHours || (h === currentHours && m > currentMinutes);
            });
        }

        res.status(200).json({ success: true, data: slotObjects, availabilityDays: availability.days });

    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
