const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const DoctorReport = require('../models/DoctorReport');
const User = require('../models/User');
const doctorReportRoutes = require('../routes/doctorReports');

let mongoServer;

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/doctor-reports', doctorReportRoutes);
  return app;
};

describe('DoctorReport Model & Routes', () => {
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
    await DoctorReport.deleteMany({});
    await User.deleteMany({});

    // Create a test user
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
  // DOCTORREPORT MODEL TESTS
  // ========================
  describe('DoctorReport Model Schema', () => {
    it('should create a doctor report with required fields', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. John Smith',
        diagnosis: ['Type 2 Diabetes', 'Hypertension'],
        prescriptions: [
          { medicine: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
          { medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        ],
        summary: 'Patient has been diagnosed with Type 2 Diabetes and needs lifestyle changes.',
        fileUrl: 'https://example.com/report.pdf',
        followUpDate: new Date('2026-01-26'),
      });

      const savedReport = await report.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.userId.toString()).toBe(testUserId.toString());
      expect(savedReport.visitDate).toEqual(new Date('2025-12-26'));
      expect(savedReport.doctorName).toBe('Dr. John Smith');
      expect(savedReport.diagnosis).toHaveLength(2);
      expect(savedReport.prescriptions).toHaveLength(2);
    });

    it('should fail to create doctor report without userId', async () => {
      const report = new DoctorReport({
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. John Smith',
      });

      await expect(report.save()).rejects.toThrow();
    });

    it('should fail to create doctor report without visitDate', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        doctorName: 'Dr. John Smith',
      });

      await expect(report.save()).rejects.toThrow();
    });

    it('should allow doctor report without optional fields', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
      });

      const savedReport = await report.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.doctorName).toBeUndefined();
      expect(savedReport.diagnosis).toBeUndefined();
      expect(savedReport.prescriptions).toBeUndefined();
    });

    it('should allow empty diagnosis array', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        diagnosis: [],
      });

      const savedReport = await report.save();

      expect(savedReport.diagnosis).toHaveLength(0);
    });

    it('should allow empty prescriptions array', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        prescriptions: [],
      });

      const savedReport = await report.save();

      expect(savedReport.prescriptions).toHaveLength(0);
    });
  });

  // ========================
  // PRESCRIPTION TESTS
  // ========================
  describe('Prescription Schema', () => {
    it('should create prescription with all fields', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        prescriptions: [
          {
            medicine: 'Aspirin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '10 days',
          },
        ],
      });

      const savedReport = await report.save();

      expect(savedReport.prescriptions[0].medicine).toBe('Aspirin');
      expect(savedReport.prescriptions[0].dosage).toBe('500mg');
      expect(savedReport.prescriptions[0].frequency).toBe('Twice daily');
      expect(savedReport.prescriptions[0].duration).toBe('10 days');
    });

    it('should fail when prescription medicine is missing', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        prescriptions: [
          {
            dosage: '500mg',
            frequency: 'Twice daily',
          },
        ],
      });

      await expect(report.save()).rejects.toThrow();
    });

    it('should allow prescription with only medicine field', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        prescriptions: [
          {
            medicine: 'Paracetamol',
          },
        ],
      });

      const savedReport = await report.save();

      expect(savedReport.prescriptions[0].medicine).toBe('Paracetamol');
      expect(savedReport.prescriptions[0].dosage).toBeUndefined();
    });

    it('should support multiple prescriptions', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        prescriptions: [
          { medicine: 'Medicine 1', dosage: '100mg' },
          { medicine: 'Medicine 2', dosage: '200mg' },
          { medicine: 'Medicine 3', dosage: '300mg' },
          { medicine: 'Medicine 4', dosage: '400mg' },
          { medicine: 'Medicine 5', dosage: '500mg' },
        ],
      });

      const savedReport = await report.save();

      expect(savedReport.prescriptions).toHaveLength(5);
    });
  });

  // ========================
  // DIAGNOSIS TESTS
  // ========================
  describe('Diagnosis Array', () => {
    it('should store multiple diagnoses', async () => {
      const diagnoses = ['Type 2 Diabetes', 'Hypertension', 'Obesity'];

      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        diagnosis: diagnoses,
      });

      const savedReport = await report.save();

      expect(savedReport.diagnosis).toHaveLength(3);
      expect(savedReport.diagnosis).toEqual(diagnoses);
    });

    it('should handle single diagnosis', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        diagnosis: ['Flu'],
      });

      const savedReport = await report.save();

      expect(savedReport.diagnosis).toHaveLength(1);
      expect(savedReport.diagnosis[0]).toBe('Flu');
    });
  });

  // ========================
  // TIMESTAMPS TESTS
  // ========================
  describe('Doctor Report Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
      });

      const savedReport = await report.save();

      expect(savedReport.createdAt).toBeDefined();
      expect(savedReport.updatedAt).toBeDefined();
      expect(savedReport.createdAt instanceof Date).toBe(true);
    });

    it('should update updatedAt when report is modified', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
      });

      const savedReport = await report.save();
      const originalUpdatedAt = savedReport.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      savedReport.summary = 'Updated summary';
      const updatedReport = await savedReport.save();

      expect(updatedReport.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  // ========================
  // COMPOUND INDEX TESTS
  // ========================
  describe('Doctor Report Queries', () => {
    beforeEach(async () => {
      await DoctorReport.insertMany([
        {
          userId: testUserId,
          visitDate: new Date('2025-12-26'),
          doctorName: 'Dr. Smith',
          diagnosis: ['Diabetes'],
        },
        {
          userId: testUserId,
          visitDate: new Date('2025-12-25'),
          doctorName: 'Dr. Jones',
          diagnosis: ['Hypertension'],
        },
        {
          userId: testUserId,
          visitDate: new Date('2025-12-24'),
          doctorName: 'Dr. Brown',
          diagnosis: ['Flu'],
        },
      ]);
    });

    it('should find doctor report by userId and visitDate', async () => {
      const reports = await DoctorReport.find({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].doctorName).toBe('Dr. Smith');
    });

    it('should sort doctor reports by visitDate in descending order', async () => {
      const reports = await DoctorReport.find({ userId: testUserId }).sort({ visitDate: -1 });

      expect(reports).toHaveLength(3);
      expect(reports[0].visitDate).toEqual(new Date('2025-12-26'));
      expect(reports[2].visitDate).toEqual(new Date('2025-12-24'));
    });

    it('should find reports within date range', async () => {
      const reports = await DoctorReport.find({
        userId: testUserId,
        visitDate: {
          $gte: new Date('2025-12-24'),
          $lte: new Date('2025-12-26'),
        },
      });

      expect(reports).toHaveLength(3);
    });

    it('should find reports by doctor name', async () => {
      const reports = await DoctorReport.find({
        userId: testUserId,
        doctorName: 'Dr. Smith',
      });

      expect(reports).toHaveLength(1);
    });
  });

  // ========================
  // POPULATION TESTS
  // ========================
  describe('Doctor Report Population', () => {
    it('should populate userId with user details', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
      });

      await report.save();

      const populatedReport = await DoctorReport.findById(report._id).populate(
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
    it('should delete doctor report by ID', async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
      });

      const savedReport = await report.save();
      await DoctorReport.findByIdAndDelete(savedReport._id);

      const deletedReport = await DoctorReport.findById(savedReport._id);
      expect(deletedReport).toBeNull();
    });

    it('should delete all reports for a user', async () => {
      await DoctorReport.insertMany([
        {
          userId: testUserId,
          visitDate: new Date('2025-12-26'),
          doctorName: 'Dr. Smith',
        },
        {
          userId: testUserId,
          visitDate: new Date('2025-12-25'),
          doctorName: 'Dr. Jones',
        },
      ]);

      await DoctorReport.deleteMany({ userId: testUserId });

      const reports = await DoctorReport.find({ userId: testUserId });
      expect(reports).toHaveLength(0);
    });
  });

  // ========================
  // POST ENDPOINT TESTS
  // ========================
  describe('POST /api/doctor-reports - Create Report', () => {
    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/doctor-reports')
        .send({
          userId: fakeUserId.toString(),
          visitDate: '2025-12-26',
          doctorName: 'Dr. Smith',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should create doctor report when user exists', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/doctor-reports')
        .send({
          userId: testUserId.toString(),
          visitDate: '2025-12-26',
          doctorName: 'Dr. Smith',
          diagnosis: ['Diabetes'],
          prescriptions: [
            { medicine: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          ],
          summary: 'Patient diagnosed with diabetes',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Doctor report created successfully');
      expect(response.body.data.doctorName).toBe('Dr. Smith');
    });
  });

  // ========================
  // GET ENDPOINT TESTS
  // ========================
  describe('GET /api/doctor-reports - Retrieve Reports', () => {
    beforeEach(async () => {
      await DoctorReport.insertMany([
        {
          userId: testUserId,
          visitDate: new Date('2025-12-26'),
          doctorName: 'Dr. Smith',
          diagnosis: ['Diabetes'],
        },
        {
          userId: testUserId,
          visitDate: new Date('2025-12-25'),
          doctorName: 'Dr. Jones',
          diagnosis: ['Hypertension'],
        },
      ]);
    });

    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/doctor-reports/user/${fakeUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should get all doctor reports for a user', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/doctor-reports/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should get reports sorted by visitDate in descending order', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/doctor-reports/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(new Date(response.body.data[0].visitDate)).toEqual(new Date('2025-12-26'));
    });

    it('should filter reports by date range', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/doctor-reports/user/${testUserId}`)
        .query({
          startDate: '2025-12-25',
          endDate: '2025-12-25',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].doctorName).toBe('Dr. Jones');
    });

    it('should get specific report by ID', async () => {
      const app = createApp();
      const report = await DoctorReport.findOne({ userId: testUserId });

      const response = await request(app).get(`/api/doctor-reports/${report._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(report._id.toString());
    });

    it('should return 404 when report ID not found', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/doctor-reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor report not found');
    });
  });

  // ========================
  // PUT ENDPOINT TESTS
  // ========================
  describe('PUT /api/doctor-reports/:id - Update Report', () => {
    let reportId;

    beforeEach(async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
        diagnosis: ['Diabetes'],
      });

      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    it('should update doctor report successfully', async () => {
      const app = createApp();

      const response = await request(app)
        .put(`/api/doctor-reports/${reportId}`)
        .send({
          doctorName: 'Dr. Updated',
          summary: 'Updated summary',
          followUpDate: '2026-01-26',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor report updated successfully');
      expect(response.body.data.doctorName).toBe('Dr. Updated');
    });

    it('should return 404 when updating non-existent report', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/doctor-reports/${fakeId}`)
        .send({ doctorName: 'Dr. New' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor report not found');
    });
  });

  // ========================
  // DELETE ENDPOINT TESTS
  // ========================
  describe('DELETE /api/doctor-reports/:id', () => {
    let reportId;

    beforeEach(async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
      });

      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    it('should delete doctor report by ID', async () => {
      const app = createApp();

      const response = await request(app).delete(`/api/doctor-reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor report deleted successfully');

      const deletedReport = await DoctorReport.findById(reportId);
      expect(deletedReport).toBeNull();
    });

    it('should return 404 when deleting non-existent report', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/doctor-reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor report not found');
    });
  });

  // ========================
  // PRESCRIPTION OPERATIONS TESTS
  // ========================
  describe('Prescription Operations', () => {
    let reportId;

    beforeEach(async () => {
      const report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
        prescriptions: [
          { medicine: 'Medicine 1', dosage: '100mg' },
        ],
      });

      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    it('should add prescription to report', async () => {
      const app = createApp();

      const response = await request(app)
        .post(`/api/doctor-reports/${reportId}/prescription`)
        .send({
          prescription: {
            medicine: 'Medicine 2',
            dosage: '200mg',
            frequency: 'Once daily',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.prescriptions).toHaveLength(2);
    });

    it('should return 404 when adding to non-existent report', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/doctor-reports/${fakeId}/prescription`)
        .send({
          prescription: {
            medicine: 'Medicine',
            dosage: '100mg',
          },
        });

      expect(response.status).toBe(404);
    });
  });

  // ========================
  // INTEGRATION TESTS
  // ========================
  describe('Doctor Report Workflow Integration', () => {
    it('should handle complete report lifecycle', async () => {
      // Create report
      let report = new DoctorReport({
        userId: testUserId,
        visitDate: new Date('2025-12-26'),
        doctorName: 'Dr. Smith',
        diagnosis: ['Diabetes'],
      });

      report = await report.save();
      expect(report._id).toBeDefined();

      // Add prescriptions
      report.prescriptions.push({ medicine: 'Metformin', dosage: '500mg' });
      report = await report.save();
      expect(report.prescriptions).toHaveLength(1);

      // Update report
      report.summary = 'Patient requires lifestyle changes';
      report.followUpDate = new Date('2026-01-26');
      report = await report.save();

      // Verify updates
      const updatedReport = await DoctorReport.findById(report._id);
      expect(updatedReport.summary).toBe('Patient requires lifestyle changes');
      expect(updatedReport.followUpDate).toEqual(new Date('2026-01-26'));

      // Delete report
      await DoctorReport.findByIdAndDelete(report._id);
      const deletedReport = await DoctorReport.findById(report._id);
      expect(deletedReport).toBeNull();
    });

    it('should track multiple doctor visits', async () => {
      const visitDates = [
        new Date('2025-12-26'),
        new Date('2025-11-26'),
        new Date('2025-10-26'),
      ];

      const reports = await DoctorReport.insertMany(
        visitDates.map(date => ({
          userId: testUserId,
          visitDate: date,
          doctorName: 'Dr. Smith',
          diagnosis: ['Checkup'],
        }))
      );

      expect(reports).toHaveLength(3);

      // Query recent visits
      const recentReports = await DoctorReport.find({
        userId: testUserId,
        visitDate: { $gte: new Date('2025-10-26') },
      }).sort({ visitDate: -1 });

      expect(recentReports).toHaveLength(3);
      expect(recentReports[0].visitDate).toEqual(new Date('2025-12-26'));
    });
  });
});
