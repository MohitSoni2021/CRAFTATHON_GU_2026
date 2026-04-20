const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.error("AIService Error: GEMINI_API_KEY is missing.");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    }

    async _retryOperation(operation, maxRetries = 3, delay = 2000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (error.message.includes('429') || error.status === 429) {
                    console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error;
                }
            }
        }
        throw new Error('Max retries exceeded for AI operation.');
    }

    async _parseJSON(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            // Robust cleanup
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanText);
            } catch (e2) {
                console.error("JSON Parse Error:", e2.message, "Text:", text);
                throw new Error("Failed to parse AI response as JSON");
            }
        }
    }

    async generateGeminiContent(prompt, modelName = "gemini-flash-latest", isJson = true) {
        return this._retryOperation(async () => {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const config = isJson ? { responseMimeType: "application/json" } : {};

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: config
            });

            const response = await result.response;
            const text = response.text();

            // Calculate tokens (rough estimate if not provided)
            const promptTokens = Math.ceil(prompt.length / 4);
            const completionTokens = Math.ceil(text.length / 4);

            return {
                text,
                data: isJson ? await this._parseJSON(text) : text,
                usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens }
            };
        });
    }

    async generateGeminiVisionContent(prompt, imageBase64, mimeType = "image/jpeg", modelName = "gemini-2.0-flash") {
        return this._retryOperation(async () => {
            const model = this.genAI.getGenerativeModel({ model: modelName });

            // Handle base64 string cleanup if needed
            let cleanBase64 = imageBase64;
            let finalMimeType = mimeType;

            if (imageBase64.includes("base64,")) {
                const parts = imageBase64.split(";base64,");
                finalMimeType = parts[0].split(":")[1];
                cleanBase64 = parts[1];
            }

            const imagePart = {
                inlineData: {
                    data: cleanBase64,
                    mimeType: finalMimeType
                }
            };

            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }, imagePart]
                }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const response = await result.response;
            const text = response.text();
            return {
                data: await this._parseJSON(text),
                text
            };
        });
    }

    async generateOpenAIVisionContent(prompt, imageUrl) {
        if (!this.openai) throw new Error("OpenAI API Key missing");

        return this._retryOperation(async () => {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 1000,
                response_format: { type: "json_object" },
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content);
        });
    }
    async generateContextAwareContent(prompt, contextData, modelName = "gemini-flash-latest") {
        const fullPrompt = `
        Context Information (Patient History):
        ${contextData}
        
        Current Request:
        ${prompt}
        `;
        return this.generateGeminiContent(fullPrompt, modelName);
    }
}

module.exports = new AIService();
