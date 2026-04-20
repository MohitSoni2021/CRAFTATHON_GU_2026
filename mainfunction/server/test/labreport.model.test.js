const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const LabReport = require('../models/LabReport');
const User = require('../models/User');
const labReportRoutes = require('../routes/labReports');

let mongoServer;

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/lab-reports', labReportRoutes);
  return app;
};

describe('LabReport Model & Routes', () => {
  let testUserId;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to MongoDB Memory Server
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Close MongoDB connection and stop in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await LabReport.deleteMany({});
    await User.deleteMany({});

    // Create a test user for lab reports
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      isVerified: true,
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  // ========================
  // LABREPORT MODEL TESTS
  // ========================
  describe('LabReport Model Schema', () => {
    it('should create a lab report with all required fields', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { glucose: 120, result: '7.2%' },
        fileUrl: 'https://example.com/report.pdf',
        notes: 'Fasting blood test',
      });

      const savedReport = await labReport.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.userId.toString()).toBe(testUserId.toString());
      expect(savedReport.reportDate).toEqual(new Date('2025-12-26'));
      expect(savedReport.testType).toBe('HbA1c');
      expect(savedReport.parsedResults.result).toBe('7.2%');
    });

    it('should fail to create lab report without userId', async () => {
      const labReport = new LabReport({
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      await expect(labReport.save()).rejects.toThrow();
    });

    it('should fail to create lab report without reportDate', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      await expect(labReport.save()).rejects.toThrow();
    });

    it('should fail to create lab report without testType', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        parsedResults: { result: '7.2%' },
      });

      await expect(labReport.save()).rejects.toThrow();
    });

    it('should allow lab report without parsedResults', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
      });

      const savedReport = await labReport.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.parsedResults).toBeUndefined();
    });

    it('should allow lab report without fileUrl', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await labReport.save();

      expect(savedReport.fileUrl).toBeUndefined();
    });

    it('should allow lab report without notes', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await labReport.save();

      expect(savedReport.notes).toBeUndefined();
    });
  });

  // ========================
  // PARSED RESULTS TESTS
  // ========================
  describe('Parsed Results Handling', () => {
    it('should store complex parsed results objects', async () => {
      const complexResults = {
        glucose: 120,
        hemoglobin: 14.5,
        whiteCells: 7.2,
        redCells: 4.8,
        platelets: 250,
        mchc: 33,
        mcv: 90,
        recommendations: ['Reduce sugar intake', 'Exercise daily'],
        doctor: 'Dr. Smith',
        lab: 'City Lab',
      };

      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'Complete Blood Count',
        parsedResults: complexResults,
      });

      const savedReport = await labReport.save();

      expect(savedReport.parsedResults.glucose).toBe(120);
      expect(savedReport.parsedResults.recommendations).toHaveLength(2);
      expect(savedReport.parsedResults.doctor).toBe('Dr. Smith');
    });

    it('should store array data in parsed results', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'Lipid Profile',
        parsedResults: {
          tests: [
            { name: 'Total Cholesterol', value: 200, unit: 'mg/dL' },
            { name: 'LDL', value: 100, unit: 'mg/dL' },
            { name: 'HDL', value: 50, unit: 'mg/dL' },
            { name: 'Triglycerides', value: 150, unit: 'mg/dL' },
          ],
        },
      });

      const savedReport = await labReport.save();

      expect(savedReport.parsedResults.tests).toHaveLength(4);
      expect(savedReport.parsedResults.tests[0].name).toBe('Total Cholesterol');
    });

    it('should store null and undefined values in parsed results', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'Test',
        parsedResults: {
          field1: 'value',
          field2: null,
          field3: undefined,
        },
      });

      const savedReport = await labReport.save();

      expect(savedReport.parsedResults.field1).toBe('value');
      expect(savedReport.parsedResults.field2).toBeNull();
    });
  });

  // ========================
  // TEST TYPE TESTS
  // ========================
  describe('Lab Report Test Types', () => {
    it('should handle various test types', async () => {
      const testTypes = [
        'HbA1c',
        'Lipid Profile',
        'Complete Blood Count',
        'Thyroid Function Test',
        'Liver Function Test',
        'Kidney Function Test',
        'Urinalysis',
        'COVID-19 Test',
      ];

      for (const testType of testTypes) {
        const labReport = new LabReport({
          userId: testUserId,
          reportDate: new Date('2025-12-26'),
          testType: testType,
          parsedResults: { result: 'positive' },
        });

        const savedReport = await labReport.save();
        expect(savedReport.testType).toBe(testType);
      }
    });

    it('should handle custom test type strings', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'Custom Test Type - Special Analysis',
        parsedResults: { custom: true },
      });

      const savedReport = await labReport.save();

      expect(savedReport.testType).toBe('Custom Test Type - Special Analysis');
    });
  });

  // ========================
  // TIMESTAMPS TESTS
  // ========================
  describe('Lab Report Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await labReport.save();

      expect(savedReport.createdAt).toBeDefined();
      expect(savedReport.updatedAt).toBeDefined();
      expect(savedReport.createdAt instanceof Date).toBe(true);
    });

    it('should update updatedAt when lab report is modified', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await labReport.save();
      const originalUpdatedAt = savedReport.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      savedReport.notes = 'Updated notes';
      const updatedReport = await savedReport.save();

      expect(updatedReport.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  // ========================
  // COMPOUND INDEX TESTS
  // ========================
  describe('Lab Report Queries with Index', () => {
    beforeEach(async () => {
      // Create multiple lab reports
      await LabReport.insertMany([
        {
          userId: testUserId,
          reportDate: new Date('2025-12-26'),
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-25'),
          testType: 'Lipid Profile',
          parsedResults: { cholesterol: 200 },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-24'),
          testType: 'HbA1c',
          parsedResults: { result: '7.0%' },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-23'),
          testType: 'Complete Blood Count',
          parsedResults: { hemoglobin: 14 },
        },
      ]);
    });

    it('should find lab reports by userId and reportDate', async () => {
      const reports = await LabReport.find({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].testType).toBe('HbA1c');
    });

    it('should sort lab reports by reportDate in descending order', async () => {
      const reports = await LabReport.find({ userId: testUserId }).sort({ reportDate: -1 });

      expect(reports).toHaveLength(4);
      expect(reports[0].reportDate).toEqual(new Date('2025-12-26'));
      expect(reports[3].reportDate).toEqual(new Date('2025-12-23'));
    });

    it('should find lab reports by userId', async () => {
      const reports = await LabReport.find({ userId: testUserId });

      expect(reports).toHaveLength(4);
    });

    it('should find lab reports within date range', async () => {
      const reports = await LabReport.find({
        userId: testUserId,
        reportDate: {
          $gte: new Date('2025-12-24'),
          $lte: new Date('2025-12-26'),
        },
      });

      expect(reports).toHaveLength(3);
    });

    it('should find lab reports by test type', async () => {
      const reports = await LabReport.find({
        userId: testUserId,
        testType: 'HbA1c',
      });

      expect(reports).toHaveLength(2);
    });

    it('should find latest report for each test type using aggregation', async () => {
      const latestReports = await LabReport.aggregate([
        { $match: { userId: testUserId } },
        { $sort: { reportDate: -1 } },
        {
          $group: {
            _id: '$testType',
            latestReport: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$latestReport' } },
      ]);

      expect(latestReports.length).toBe(3); // HbA1c, Lipid Profile, CBC
      const testTypes = latestReports.map(r => r.testType);
      expect(testTypes).toContain('HbA1c');
      expect(testTypes).toContain('Lipid Profile');
      expect(testTypes).toContain('Complete Blood Count');
    });
  });

  // ========================
  // POPULATION TESTS
  // ========================
  describe('Lab Report Population', () => {
    it('should populate userId with user details', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      await labReport.save();

      const populatedReport = await LabReport.findById(labReport._id).populate(
        'userId',
        'name email'
      );

      expect(populatedReport.userId.name).toBe('Test User');
      expect(populatedReport.userId.email).toBe('testuser@example.com');
    });
  });

  // ========================
  // DELETE OPERATIONS TESTS
  // ========================
  describe('Delete Operations', () => {
    it('should delete lab report by ID', async () => {
      const labReport = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await labReport.save();
      await LabReport.findByIdAndDelete(savedReport._id);

      const deletedReport = await LabReport.findById(savedReport._id);
      expect(deletedReport).toBeNull();
    });

    it('should delete all lab reports for a user', async () => {
      await LabReport.insertMany([
        {
          userId: testUserId,
          reportDate: new Date('2025-12-26'),
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-25'),
          testType: 'Lipid Profile',
          parsedResults: { cholesterol: 200 },
        },
      ]);

      await LabReport.deleteMany({ userId: testUserId });

      const reports = await LabReport.find({ userId: testUserId });
      expect(reports).toHaveLength(0);
    });
  });

  // ========================
  // POST ENDPOINT TESTS
  // ========================
  describe('POST /api/lab-reports - Create Lab Report', () => {
    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/lab-reports')
        .send({
          userId: fakeUserId.toString(),
          reportDate: '2025-12-26',
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should create lab report when user exists', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/lab-reports')
        .send({
          userId: testUserId.toString(),
          reportDate: '2025-12-26',
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
          fileUrl: 'https://example.com/report.pdf',
          notes: 'Normal result',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Lab report created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.testType).toBe('HbA1c');
    });

    it('should create lab report with minimal data', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/lab-reports')
        .send({
          userId: testUserId.toString(),
          reportDate: '2025-12-26',
          testType: 'COVID-19 Test',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.testType).toBe('COVID-19 Test');
    });
  });

  // ========================
  // GET ENDPOINTS TESTS
  // ========================
  describe('GET /api/lab-reports - Retrieve Lab Reports', () => {
    beforeEach(async () => {
      // Create test lab reports
      await LabReport.insertMany([
        {
          userId: testUserId,
          reportDate: new Date('2025-12-26'),
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-25'),
          testType: 'Lipid Profile',
          parsedResults: { cholesterol: 200 },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-24'),
          testType: 'HbA1c',
          parsedResults: { result: '7.0%' },
        },
      ]);
    });

    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/lab-reports/user/${fakeUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should get all lab reports for a user', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/lab-reports/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it('should get lab reports sorted by reportDate in descending order', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/lab-reports/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(new Date(response.body.data[0].reportDate)).toEqual(new Date('2025-12-26'));
      expect(new Date(response.body.data[2].reportDate)).toEqual(new Date('2025-12-24'));
    });

    it('should filter lab reports by date range', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/lab-reports/user/${testUserId}`)
        .query({
          startDate: '2025-12-25',
          endDate: '2025-12-25',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].testType).toBe('Lipid Profile');
    });

    it('should get lab reports by test type', async () => {
      const app = createApp();

      const response = await request(app).get(
        `/api/lab-reports/user/${testUserId}/test-type/HbA1c`
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should get specific lab report by ID', async () => {
      const app = createApp();
      const report = await LabReport.findOne({ userId: testUserId });

      const response = await request(app).get(`/api/lab-reports/${report._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(report._id.toString());
      expect(response.body.data.testType).toBe(report.testType);
    });

    it('should return 404 when lab report ID not found', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/lab-reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Lab report not found');
    });

    it('should search lab reports by test type name', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/lab-reports/user/${testUserId}/search`)
        .query({ testType: 'lipid' }); // case-insensitive search

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].testType).toBe('Lipid Profile');
    });

    it('should search lab reports with date range', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/lab-reports/user/${testUserId}/search`)
        .query({
          testType: 'HbA1c',
          startDate: '2025-12-24',
          endDate: '2025-12-26',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get latest lab reports by test type', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/lab-reports/user/${testUserId}/latest`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2); // HbA1c and Lipid Profile
      const testTypes = response.body.data.map(r => r.testType);
      expect(testTypes).toContain('HbA1c');
      expect(testTypes).toContain('Lipid Profile');
    });
  });

  // ========================
  // PUT ENDPOINT TESTS
  // ========================
  describe('PUT /api/lab-reports/:id - Update Lab Report', () => {
    let reportId;

    beforeEach(async () => {
      const report = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
        notes: 'Initial notes',
      });

      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    it('should update lab report successfully', async () => {
      const app = createApp();

      const response = await request(app)
        .put(`/api/lab-reports/${reportId}`)
        .send({
          notes: 'Updated notes',
          parsedResults: { result: '7.0%', status: 'improved' },
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Lab report updated successfully');
      expect(response.body.data.notes).toBe('Updated notes');
      expect(response.body.data.parsedResults.status).toBe('improved');
    });

    it('should return 404 when updating non-existent lab report', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/lab-reports/${fakeId}`)
        .send({ notes: 'New notes' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Lab report not found');
    });

    it('should allow partial updates', async () => {
      const app = createApp();

      const response = await request(app)
        .put(`/api/lab-reports/${reportId}`)
        .send({ notes: 'Only update notes' });

      expect(response.status).toBe(200);
      expect(response.body.data.notes).toBe('Only update notes');
      expect(response.body.data.testType).toBe('HbA1c');
    });
  });

  // ========================
  // DELETE ENDPOINT TESTS
  // ========================
  describe('DELETE /api/lab-reports/:id', () => {
    let reportId;

    beforeEach(async () => {
      const report = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    it('should delete lab report by ID', async () => {
      const app = createApp();

      const response = await request(app).delete(`/api/lab-reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Lab report deleted successfully');

      const deletedReport = await LabReport.findById(reportId);
      expect(deletedReport).toBeNull();
    });

    it('should return 404 when deleting non-existent lab report', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/lab-reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Lab report not found');
    });
  });

  // ========================
  // COMPREHENSIVE INTEGRATION TESTS
  // ========================
  describe('Lab Report Workflow Integration', () => {
    it('should handle complete lab report lifecycle', async () => {
      // Create initial lab report
      let report = new LabReport({
        userId: testUserId,
        reportDate: new Date('2025-12-26'),
        testType: 'HbA1c',
        parsedResults: { result: '7.2%' },
      });

      report = await report.save();
      expect(report._id).toBeDefined();

      // Update the report
      report.notes = 'Patient advised to reduce sugar intake';
      report.parsedResults.status = 'needs-improvement';
      report = await report.save();

      // Verify update
      const updatedReport = await LabReport.findById(report._id);
      expect(updatedReport.notes).toBe('Patient advised to reduce sugar intake');
      expect(updatedReport.parsedResults.status).toBe('needs-improvement');

      // Delete the report
      await LabReport.findByIdAndDelete(report._id);
      const deletedReport = await LabReport.findById(report._id);
      expect(deletedReport).toBeNull();
    });

    it('should track multiple lab reports over time', async () => {
      const reportDates = [
        new Date('2025-12-26'),
        new Date('2025-11-26'),
        new Date('2025-10-26'),
        new Date('2025-09-26'),
      ];

      const reports = await LabReport.insertMany(
        reportDates.map(date => ({
          userId: testUserId,
          reportDate: date,
          testType: 'HbA1c',
          parsedResults: {
            result: `${(6.5 + Math.random() * 1.5).toFixed(1)}%`,
          },
        }))
      );

      expect(reports).toHaveLength(4);

      // Query for recent 3 months
      const recentReports = await LabReport.find({
        userId: testUserId,
        reportDate: {
          $gte: new Date('2025-09-26'),
        },
      }).sort({ reportDate: -1 });

      expect(recentReports).toHaveLength(4);
      expect(recentReports[0].reportDate).toEqual(new Date('2025-12-26'));
    });

    it('should organize reports by test type', async () => {
      const testTypes = ['HbA1c', 'Lipid Profile', 'Thyroid Function', 'Complete Blood Count'];

      await Promise.all(
        testTypes.map(testType =>
          LabReport.insertMany([
            {
              userId: testUserId,
              reportDate: new Date('2025-12-26'),
              testType: testType,
              parsedResults: { status: 'normal' },
            },
            {
              userId: testUserId,
              reportDate: new Date('2025-11-26'),
              testType: testType,
              parsedResults: { status: 'normal' },
            },
          ])
        )
      );

      // Get latest for each type
      const latestReports = await LabReport.aggregate([
        { $match: { userId: testUserId } },
        { $sort: { reportDate: -1 } },
        {
          $group: {
            _id: '$testType',
            latestReport: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$latestReport' } },
      ]);

      expect(latestReports).toHaveLength(4);
      latestReports.forEach(report => {
        expect(report.reportDate).toEqual(new Date('2025-12-26'));
      });
    });

    it('should handle multiple users with separate lab reports', async () => {
      // Create second user
      const user2 = new User({
        name: 'Another User',
        email: 'anotheruser@example.com',
        password: 'password123',
        isVerified: true,
      });
      const savedUser2 = await user2.save();

      // Create reports for both users
      await LabReport.insertMany([
        {
          userId: testUserId,
          reportDate: new Date('2025-12-26'),
          testType: 'HbA1c',
          parsedResults: { result: '7.2%' },
        },
        {
          userId: testUserId,
          reportDate: new Date('2025-12-25'),
          testType: 'Lipid Profile',
          parsedResults: { cholesterol: 200 },
        },
        {
          userId: savedUser2._id,
          reportDate: new Date('2025-12-26'),
          testType: 'COVID-19 Test',
          parsedResults: { result: 'negative' },
        },
      ]);

      // Verify reports are isolated by user
      const user1Reports = await LabReport.find({ userId: testUserId });
      const user2Reports = await LabReport.find({ userId: savedUser2._id });

      expect(user1Reports).toHaveLength(2);
      expect(user2Reports).toHaveLength(1);
      expect(user2Reports[0].testType).toBe('COVID-19 Test');
    });

    it('should support bulk operations on lab reports', async () => {
      // Create multiple reports
      const reports = await LabReport.insertMany(
        Array.from({ length: 5 }, (_, i) => ({
          userId: testUserId,
          reportDate: new Date(`2025-12-${26 - i}`),
          testType: i % 2 === 0 ? 'HbA1c' : 'Lipid Profile',
          parsedResults: { value: 100 + i * 10 },
        }))
      );

      expect(reports).toHaveLength(5);

      // Update all HbA1c reports
      const updateResult = await LabReport.updateMany(
        { userId: testUserId, testType: 'HbA1c' },
        { $set: { notes: 'Batch updated' } }
      );

      expect(updateResult.modifiedCount).toBeGreaterThan(0);

      // Verify updates
      const updatedReports = await LabReport.find({
        userId: testUserId,
        testType: 'HbA1c',
      });

      updatedReports.forEach(report => {
        expect(report.notes).toBe('Batch updated');
      });
    });
  });
});
