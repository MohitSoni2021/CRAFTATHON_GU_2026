const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const { encrypt } = require('../utils/cryptoUtils');

let mongoServer;

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({
                            labReport: {
                                labName: "Test Lab",
                                reportDate: "2023-10-27",
                                testType: "CBC"
                            },
                            patientDetails: {
                                patientName: "Test Patient"
                            },
                            tests: [
                                {
                                    testName: "Hemoglobin",
                                    resultValue: 14.5,
                                    unit: "g/dL",
                                    referenceRange: "13.0-17.0",
                                    resultStatus: "NORMAL"
                                }
                            ],
                            summary: {
                                totalTests: 1,
                                abnormalTests: 0,
                                criticalFindings: false
                            }
                        })
                    }
                })
            })
        }))
    };
});

// Mock Cloudinary
jest.mock('../utils/cloudinaryConfig', () => ({
    uploader: {
        upload: jest.fn().mockResolvedValue({ secure_url: 'http://cloudinary.com/test.jpg' })
    }
}));

// Mock Mailer
jest.mock('../utils/mailer', () => ({
    sendOTP: jest.fn().mockResolvedValue(true)
}));

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect(); // Disconnect existing connection from server.js
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Lab Report Analysis API', () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Create a verified user
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            age: 30,
            isVerified: true
        });
        await user.save();
        userId = user._id;

        // Login to get token
        const encryptedData = encrypt({
            email: 'test@example.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ encryptedData });

        token = res.body.token;
    });

    afterEach(async () => {
        await User.deleteMany({});
        await mongoose.connection.collection('labreports').deleteMany({});
    });

    it('should analyze a lab report and save it', async () => {
        const dummyImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eXqAg4SFhoeIiYqSk5SVlpeYmZqgo6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A6CiiigD/2Q==";

        const res = await request(app)
            .post('/api/ai/analyze-lab-report')
            .set('Authorization', `Bearer ${token}`)
            .send({ image: dummyImage });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Lab report analyzed successfully");
        expect(res.body.data).toHaveProperty('parsedResults');
        expect(res.body.data.parsedResults.labReport.labName).toBe("Test Lab");

        // Verify DB
        const reports = await mongoose.connection.collection('labreports').find().toArray();
        expect(reports.length).toBe(1);
        expect(reports[0].parsedResults.labReport.labName).toBe("Test Lab");
    });

    it('should return 400 if no image provided', async () => {
        const res = await request(app)
            .post('/api/ai/analyze-lab-report')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
    });
});
