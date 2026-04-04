const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');
const { sendMeetingApproval } = require('../utils/emailService');

// @desc    Request a case conference meeting
// @route   POST /api/meetings/request
// @access  Doctor
exports.requestMeeting = async (req, res) => {
    try {
        const { topic, reason, urgency } = req.body;

        const newRequest = new MeetingRequest({
            requester: req.user.id,
            topic,
            reason,
            urgency
        });

        await newRequest.save();

        res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
        console.error("Request Meeting Error", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all pending meeting requests
// @route   GET /api/meetings/pending
// @access  Admin
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await MeetingRequest.find({ status: 'pending' })
            .populate('requester', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error("Get Methods Error", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve a meeting request and notify ALL doctors
// @route   PUT /api/meetings/approve/:id
// @access  Admin
exports.approveMeeting = async (req, res) => {
    try {
        const { meetingLink, scheduledAt, duration } = req.body;
        const request = await MeetingRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = 'approved';
        request.meetingLink = meetingLink || `https://meet.google.com/new`;
        request.scheduledAt = scheduledAt || new Date();
        request.duration = duration || 60;

        await request.save();

        // 1. Find ALL Doctors
        const doctors = await User.find({ type: 'doctor' });

        // 2. Send Emails (in background) via Service
        doctors.forEach(doc => {
            if (doc.email && doc.email.includes('@')) {
                sendMeetingApproval(doc.email, request.topic, request.meetingLink, request.reason, request.scheduledAt);
            }
        });

        res.status(200).json({ success: true, data: request, message: `Meeting approved. Notifying ${doctors.length} doctors.` });
    } catch (error) {
        console.error("Approve Meeting Error", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all relevant meetings (Upcoming & Recent Past with Summaries)
// @route   GET /api/meetings/upcoming
// @access  Doctor/Admin
exports.getUpcomingMeetings = async (req, res) => {
    try {
        const now = new Date();

        // 1. Upcoming: Scheduled in future OR approved but no time set (yet)
        // We use a loose filter to ensure visibility
        const upcoming = await MeetingRequest.find({
            status: 'approved',
            scheduledAt: { $gte: now }
        }).populate('requester', 'name').sort({ scheduledAt: 1 });

        // 2. Past/Summarized: Scheduled in past OR have a summary
        const past = await MeetingRequest.find({
            status: 'approved',
            $or: [
                { scheduledAt: { $lt: now } },
                { summary: { $exists: true, $ne: "" } }
            ]
        }).populate('requester', 'name').sort({ scheduledAt: -1 }).limit(10); // Limit to last 10

        // Merge or send as separate? Front-end expects 'data' array.
        // Let's send a combined list but sorted smartly? 
        // Actually, easiest for current UI is to just send ALL approved meetings sorted by date descending.
        // The UI can filter if needed, or we just show them all.

        const all = await MeetingRequest.find({ status: 'approved' })
            .populate('requester', 'name')
            .sort({ scheduledAt: -1 }); // Newest/Future first

        res.status(200).json({ success: true, data: all });
    } catch (error) {
        console.error("Get Meetings Error", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Generate Meeting Summary from Audio
// @route   POST /api/meetings/summarize/:id
// @access  Admin
exports.summarizeMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const request = await MeetingRequest.findById(meetingId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an audio recording' });
        }

        // Initialize Gemini
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const { GoogleAIFileManager } = require("@google/generative-ai/server");
        const fs = require('fs');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 1. Upload file to Google GenAI
        const uploadResponse = await fileManager.uploadFile(req.file.path, {
            mimeType: req.file.mimetype,
            displayName: `Meeting_${meetingId}`,
        });

        // 2. Generate Content
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: "Detailed Medical Summary of this conference. Include: 1. Clinical Consensus 2. Action Plan 3. Key Decisions." }
        ]);

        const summaryText = result.response.text();

        // 3. Save Summary & Optional Link
        request.summary = summaryText;
        if (req.body.recordingLink) {
            request.recordingLink = req.body.recordingLink;
        }
        await request.save();

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.status(200).json({ success: true, data: request, summary: summaryText });

    } catch (error) {
        console.error("Summarize Error", error);
        res.status(500).json({ success: false, message: 'Summary Generation Failed' });
    }
};
