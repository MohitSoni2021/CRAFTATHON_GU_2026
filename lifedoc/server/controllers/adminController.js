const User = require('../models/User');
const Article = require('../models/Article'); // Assuming you want stats on articles too
const Appointment = require('../models/Appointment');

// Get System Stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ type: 'user' });
        const totalDoctors = await User.countDocuments({ type: 'doctor' });
        const totalAdmins = await User.countDocuments({ type: 'admin' });
        const totalArticles = await Article.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        res.status(200).json({
            users: totalUsers,
            doctors: totalDoctors,
            admins: totalAdmins,
            articles: totalArticles,
            appointments: totalAppointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

// Get All Users (Paginated)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password') // Exclude password
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
