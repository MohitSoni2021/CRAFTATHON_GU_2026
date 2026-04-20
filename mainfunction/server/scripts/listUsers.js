const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc");
        console.log("Connected to MongoDB");

        const users = await User.find({}, 'name email type');
        console.log("\n--- USER LIST ---");
        users.forEach(u => {
            console.log(`${u.email} (${u.name}) - Role: ${u.type}`);
        });
        console.log("-----------------\n");

        process.exit(0);
    } catch (error) {
        console.error("Error listing users:", error);
        process.exit(1);
    }
};

listUsers();
