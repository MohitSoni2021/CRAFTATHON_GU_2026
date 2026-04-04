const User = require('../models/User');
const twilio = require('twilio');

// Initialize Twilio Client
// NOTE: Ensure these are set in your .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

exports.sendSOS = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.userId; // Provided by auth middleware

        // 1. Find User and Contacts
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const contacts = user.sosContacts;
        if (!contacts || contacts.length === 0) {
            return res.status(400).json({ error: 'No emergency contacts set. Please add them in your profile.' });
        }

        // 2. Construct Message
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const messageBody = `🚨 SOS ALERT! 🚨\n${user.name} needs help!\nLocation: ${mapsLink}\nPlease contact them immediately.`;

        // 3. Send SMS to all contacts (Parallel)
        // NOTE: In free trial Twilio accounts, you can only send to verified numbers.
        const smsPromises = contacts.map(contact => {
            return client.messages.create({
                body: messageBody,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phone
            });
        });

        await Promise.allSettled(smsPromises);

        res.status(200).json({ message: 'SOS Alerts sent successfully', count: contacts.length });

    } catch (error) {
        console.error('SOS Error:', error);
        res.status(500).json({ error: 'Failed to send SOS alerts' });
    }
};
