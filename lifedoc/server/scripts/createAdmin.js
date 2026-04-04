const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Load .env from current directory

const promoteUser = async () => {
    const email = process.argv[2]; // Get email from command line argument

    if (!email) {
        console.error('Please provide an email address. Usage: node createAdmin.js <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc");
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.type = 'admin';
        await user.save();

        console.log(`Success! User ${user.name} (${user.email}) is now an ADMIN.`);
        process.exit(0);

    } catch (error) {
        console.error("Error promoting user:", error);
        process.exit(1);
    }
};

promoteUser();
