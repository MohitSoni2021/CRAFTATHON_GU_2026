const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const aiService = require('../services/aiService');
const auth = require('../middleware/authMiddleware');
const checkUsageLimit = require('../middleware/usageMiddleware');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const LabReport = require('../models/LabReport');
const User = require('../models/User');

// POST /api/ai/analyze
// Desc: Analyze symptoms
router.post('/analyze', auth, checkUsageLimit('consultation'), async (req, res, next) => {
    try {
        const { text, language } = req.body;

        if (!text) {
            return res.status(400).json({ msg: 'Please provide symptom text' });
        }

        const prompt = `
        You are Docmetry, an AI medical assistant. 
        Analyze the following symptom description from a patient: "${text}"
        
        Provide the response in strict JSON format with these fields:
        - summary: A conversational, empathetic summary addressed TO the patient (e.g., "I understand you are feeling...").
        - urgency: "Low", "Medium", or "High".
        - actions: A list of 2-3 simple, immediate actionable steps.
        - lifestyleAdvice: A list of 2-3 lifestyle changes or habits to improve their condition (e.g., diet, sleep, exercise).
        - suggestedMedicines: A list of common over-the-counter medications that MIGHT help (must include a disclaimer like "Consult a doctor first").
        - language: The response MUST be in ${language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English'}.

        IMPORTANT requirements:
        1. Output ONLY valid JSON. No markdown backticks.
        2. Be empathetic and professional.
        3. If the input is nonsense, politely ask for clarification in the summary.
        `;

        const { data, usage } = await aiService.generateGeminiContent(prompt, "gemini-flash-latest");

        // Increment Usage
        if (req.incrementUsage) await req.incrementUsage();

        // Save to Database
        const newConsultation = new Consultation({
            user: req.user.id,
            symptoms: text,
            aiSummary: data.summary,
            urgency: data.urgency,
            actions: data.actions || [],
            lifestyleAdvice: data.lifestyleAdvice || [],
            suggestedMedicines: data.suggestedMedicines || [],
            language: language || 'en',
            tokenUsage: usage
        });

        await newConsultation.save();

        res.json({
            ...data,
            _id: newConsultation._id,
            reviewStatus: newConsultation.reviewStatus
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/ai/analyze-prescription
// Desc: Analyze prescription image using Vision model
router.post('/analyze-prescription', auth, checkUsageLimit('ocr'), async (req, res, next) => {
    try {
        const { image } = req.body; // Base64 image string

        if (!image) {
            return res.status(400).json({ msg: 'Please upload an image' });
        }

        const prompt = `
        You are an expert pharmacist and doctor assistant.
        Analyze this prescription image. 
        
        Extract the following details in strict JSON format:
        - medicines: array of objects { name, dosage, timing (e.g., "Morning-Night"), precaution (e.g., "After food") }
        - audioSummary: A simple, clear paragraph explaining to the patient how to take their medicines in plain language (e.g., "You have 3 medicines. Take the Paracetamol after lunch...").
        
        If you cannot read the prescription or if it's not a prescription, return an error message in the summary.
        `;

        const data = await aiService.generateOpenAIVisionContent(prompt, image);

        // Increment Usage
        if (req.incrementUsage) await req.incrementUsage();

        // Save to Database
        const newPrescription = new Prescription({
            user: req.user.id,
            image: image,
            medicines: data.medicines,
            audioSummary: data.audioSummary
        });

        await newPrescription.save();

        res.json(data);

    } catch (err) {
        next(err);
    }
});

// POST /api/ai/summerizer
// Desc: Summarize diary entry using Gemini
router.post('/summerizer', auth, async (req, res, next) => {
    try {
        const { prompt } = req.query; // e.g. "diarySummerizer"
        const { text, date } = req.body;

        if (!prompt) {
            return res.status(400).json({ msg: 'Prompt query parameter is required' });
        }

        // Validate prompt file exists
        const promptPath = path.join(__dirname, `../prompts/${prompt}.txt`);
        if (!fs.existsSync(promptPath)) {
            return res.status(404).json({ msg: 'Prompt file not found' });
        }

        const basePrompt = fs.readFileSync(promptPath, 'utf8');
        const fullPrompt = `${basePrompt}\n\nUser Diary Entry (${date || 'Today'}):\n${text}\n\nOutput JSON:`;

        const { data } = await aiService.generateGeminiContent(fullPrompt, "gemini-flash-latest");

        res.json(data);

    } catch (err) {
        next(err);
    }
});

// POST /api/ai/analyze-lab-report
// Desc: Analyze lab report image/PDF using Gemini
router.post('/analyze-lab-report', auth, checkUsageLimit('ocr'), async (req, res, next) => {
    try {
        const { image, notes, reportDate: userDate, testType: userTestType } = req.body;

        if (!image) {
            return res.status(400).json({ msg: 'Please upload a lab report image' });
        }

        // Read the prompt
        const promptPath = path.join(__dirname, '../prompts/labReportAnalyzer.txt');
        if (!fs.existsSync(promptPath)) {
            return res.status(500).json({ msg: 'System Error: Prompt file missing' });
        }
        const systemPrompt = fs.readFileSync(promptPath, 'utf8');

        const { data: aiResult } = await aiService.generateGeminiVisionContent(systemPrompt, image, "image/jpeg", "gemini-2.0-flash");

        // Determine test type and date
        const finalReportDate = userDate ? new Date(userDate) : (aiResult.labReport?.reportDate ? new Date(aiResult.labReport.reportDate) : new Date());

        let finalTestType = userTestType || "General Lab Report";
        if (!userTestType && aiResult.tests && aiResult.tests.length > 0) {
            finalTestType = aiResult.tests[0].testCategory || aiResult.tests[0].testName || "General Lab Report";
        }

        // Upload to Cloudinary
        const cloudinary = require('../utils/cloudinary');
        let cloudinaryUrl = null;
        try {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'lab_reports',
                resource_type: 'auto'
            });
            cloudinaryUrl = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError.message);
        }

        const newLabReport = new LabReport({
            userId: req.user.id,
            reportDate: finalReportDate,
            testType: finalTestType,
            parsedResults: aiResult,
            fileUrl: cloudinaryUrl || image,
            originalReport: cloudinaryUrl,
            notes: notes || "Analyzed by AI"
        });

        await newLabReport.save();

        res.json({
            message: "Lab report analyzed successfully",
            data: newLabReport,
            aiAnalysis: aiResult
        });

    } catch (err) {
        next(err);
    }
});

// POST /api/ai/generate-questions
// Desc: Generate lifestyle questions based on chronic conditions
router.post('/generate-questions', auth, async (req, res, next) => {
    try {
        const { diseases } = req.body;

        const prompt = `
        You are a medical expert. The user has the following conditions: ${diseases && diseases.length > 0 ? diseases.join(", ") : "None"}.
        Generate 3 to 5 specific, relevant questions to ask this user to understand their lifestyle, diet, and daily habits better, which will help in creating a personalized health summary.
        
        Requirements:
        1. Generate a mix of Multiple Choice Questions (MCQ) and Text Input questions.
        2. If the user has specific diseases, ask about medication adherence, specific diet restrictions, etc.
        3. If "None" or empty, ask about general fitness, diet, and stress.
        
        Output strictly a JSON array of objects with this structure:
        [
            {
                "id": 1,
                "question": "Question text here",
                "type": "mcq", 
                "options": ["Option 1", "Option 2", "Option 3"],
                "ans": ""
            },
            {
                "id": 2,
                "question": "Question text here",
                "type": "text",
                "options": [],
                "ans": ""
            }
        ]
        Ensure you include at least one "mcq" and one "text" type question.
        Do not include markdown formatting.
        `;

        const { data } = await aiService.generateGeminiContent(prompt, "gemini-flash-latest");
        res.json(data);

    } catch (err) {
        next(err);
    }
});

// POST /api/ai/analyze-lifestyle
// Desc: Analyze answers and update user storyDesc
router.post('/analyze-lifestyle', auth, async (req, res, next) => {
    try {
        const { answers, diseases, additionalDetails, userProfile } = req.body;

        const prompt = `
        You are a medical expert. Analyze the following user profile and questionnaire answers.
        
        Conditions: ${diseases ? diseases.join(", ") : "None"}
        
        User Profile:
        Age: ${userProfile?.age || "Not specified"}
        Gender: ${userProfile?.gender || "Not specified"}
        Height: ${userProfile?.height ? userProfile.height + " cm" : "Not specified"}
        Weight: ${userProfile?.weight ? userProfile.weight + " kg" : "Not specified"}
        Blood Group: ${userProfile?.bloodGroup || "Not specified"}

        Q&A:
        ${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")}
        
        Additional Details from User:
        ${additionalDetails || "None provided"}
        
        Create a comprehensive, empathetic, and professional summary of the user's health lifestyle, habits, and potential areas for improvement. 
        This summary will be displayed on their profile as "My Health Story".
        Keep it under 150 words. Use "You" to address the user.
        
        Output strictly JSON:
        {
            "summary": "Your summary text here..."
        }
        `;

        const { data } = await aiService.generateGeminiContent(prompt, "gemini-flash-latest");

        await User.findByIdAndUpdate(req.user.id, {
            $set: { "profile.storyDesc": data.summary }
        });

        res.json(data);

    } catch (err) {
        next(err);
    }
});

// POST /api/ai/guide
// Desc: General Voice Assistant Persona
router.post('/guide', auth, async (req, res, next) => {
    try {
        const { text } = req.body;

        // Read the prompt
        const promptPath = path.join(__dirname, '../prompts/voicePersona.txt');
        if (!fs.existsSync(promptPath)) {
            return res.status(500).json({ msg: 'System Error: Prompt file missing' });
        }
        const systemPrompt = fs.readFileSync(promptPath, 'utf8');

        const fullPrompt = `${systemPrompt}\n\nUser Question: "${text}"\n\nRespond as valid JSON:`;

        const { data } = await aiService.generateGeminiContent(fullPrompt, "gemini-flash-latest");

        res.json(data);

    } catch (err) {
        next(err);
    }
});

module.exports = router;
