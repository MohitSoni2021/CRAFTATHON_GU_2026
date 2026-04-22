const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Direct schema to bypass the pre-save hook double-hashing issue
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: { type: String, unique: true },
    password: String,
    type: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    profileImage: String,
    isManaged: Boolean,
    profile: mongoose.Schema.Types.Mixed,
    subscription: mongoose.Schema.Types.Mixed,
    usage: mongoose.Schema.Types.Mixed,
    sosContacts: [mongoose.Schema.Types.Mixed],
    availability: mongoose.Schema.Types.Mixed,
    emergencySettings: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'mohit@gmail.com';
        const plainPassword = '123456789';

        // Hash password ONCE here (no pre-save hook on this raw schema)
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const existing = await User.findOne({ email });

        if (existing) {
            // Force update password and role directly (bypass hooks)
            await User.updateOne(
                { email },
                {
                    $set: {
                        name: 'Mohit Soni',
                        type: 'admin',
                        isVerified: true,
                        password: hashedPassword,
                    }
                }
            );
            console.log('✅ Existing user updated to admin with new password');
        } else {
            await User.create({
                name: 'Mohit Soni',
                email,
                password: hashedPassword,
                type: 'admin',
                isVerified: true,
                age: 25,
                subscription: { plan: 'premium', status: 'active' },
                usage: { aiConsultations: 0, ocrScans: 0 },
            });
            console.log('✅ Admin user created successfully');
        }

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Email   : mohit@gmail.com');
        console.log('  Password: 123456789');
        console.log('  Role    : admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
