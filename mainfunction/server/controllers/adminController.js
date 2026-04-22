const User = require('../models/User');
const Article = require('../models/Article');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcrypt');

// Get System Stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ type: 'user' });
        const totalDoctors = await User.countDocuments({ type: 'doctor' });
        const totalAdmins = await User.countDocuments({ type: 'admin' });
        const totalArticles = await Article.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const premiumUsers = await User.countDocuments({ 'subscription.plan': 'premium' });

        // New users this month
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: firstOfMonth } });

        res.status(200).json({
            users: totalUsers,
            doctors: totalDoctors,
            admins: totalAdmins,
            articles: totalArticles,
            appointments: totalAppointments,
            premiumUsers,
            newUsersThisMonth,
            totalAll: totalUsers + totalDoctors + totalAdmins,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

// Get All Users (Paginated + Search)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const typeFilter = req.query.type || '';

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (typeFilter) {
            query.type = typeFilter;
        }

        const users = await User.find(query)
            .select('-password -otp -otpExpires')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

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

// Get Single User Detail
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        const allowedTypes = ['user', 'doctor', 'admin'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedTypes.join(', ')}` });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { type },
            { new: true, select: '-password -otp -otpExpires' }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

// Toggle User Subscription
exports.toggleSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan } = req.body; // 'free' or 'premium'

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.subscription.plan = plan;
        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({ message: `User plan set to ${plan}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating subscription', error: error.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.type === 'admin') {
            return res.status(403).json({ message: 'Cannot delete an admin account' });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Seed Admin User (dev utility)
exports.createAdminUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email, and password are required' });
        }

        // Hash password ONCE here — bypass pre-save hook via updateOne/collection.insertOne
        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await User.findOne({ email });
        if (existing) {
            // Use updateOne to bypass the pre-save hook (which would re-hash)
            await User.updateOne(
                { email },
                { $set: { name, type: 'admin', isVerified: true, password: hashedPassword } }
            );
            return res.status(200).json({ message: 'User promoted to admin with updated password', user: { email, type: 'admin' } });
        }

        // Use collection.insertOne to bypass pre-save hook entirely
        await User.collection.insertOne({
            name,
            email,
            password: hashedPassword,
            type: 'admin',
            isVerified: true,
            subscription: { plan: 'premium', status: 'active' },
            usage: { aiConsultations: 0, ocrScans: 0, lastResetDate: new Date() },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ message: 'Admin user created successfully', user: { name, email, type: 'admin' } });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
};

// Admin Reset User Password
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Hash ONCE and use updateOne to bypass the pre-save hook (avoid double-hashing)
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id: id }, { $set: { password: hashedPassword } });

        res.status(200).json({ message: `Password reset successfully for ${user.name}` });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};
