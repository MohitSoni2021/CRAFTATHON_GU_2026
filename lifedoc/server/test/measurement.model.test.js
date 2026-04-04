const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const Measurement = require('../models/Measurement');
const User = require('../models/User');
const measurementRoutes = require('../routes/measurements');

let mongoServer;

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/measurements', measurementRoutes);
  return app;
};

describe('Measurement Model & Routes', () => {
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
    await Measurement.deleteMany({});
    await User.deleteMany({});

    // Create a test user for measurements
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
  // MEASUREMENT MODEL TESTS
  // ========================
  describe('Measurement Model Schema', () => {
    it('should create a measurement with required fields', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
            notes: 'fasting',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement._id).toBeDefined();
      expect(savedMeasurement.userId.toString()).toBe(testUserId.toString());
      expect(savedMeasurement.readings).toHaveLength(1);
      expect(savedMeasurement.readings[0].type).toBe('glucose');
    });

    it('should fail to create measurement without userId', async () => {
      const measurement = new Measurement({
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
          },
        ],
      });

      await expect(measurement.save()).rejects.toThrow();
    });

    it('should fail to create measurement without date', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
          },
        ],
      });

      await expect(measurement.save()).rejects.toThrow();
    });

    it('should allow empty readings array', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings).toHaveLength(0);
    });
  });

  // ========================
  // MEASUREMENT READING TESTS
  // ========================
  describe('Measurement Reading Schema', () => {
    it('should validate reading type enum values', async () => {
      const validTypes = ['glucose', 'bloodPressure', 'weight', 'heartRate', 'spo2', 'other'];

      for (const type of validTypes) {
        const measurement = new Measurement({
          userId: testUserId,
          date: new Date('2025-12-26'),
          readings: [
            {
              type: type,
              value: 100,
              unit: 'unit',
            },
          ],
        });

        const savedMeasurement = await measurement.save();
        expect(savedMeasurement.readings[0].type).toBe(type);
      }
    });

    it('should reject invalid reading type', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'invalidType',
            value: 100,
            unit: 'unit',
          },
        ],
      });

      await expect(measurement.save()).rejects.toThrow();
    });

    it('should fail when reading type is missing', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            value: 100,
            unit: 'unit',
          },
        ],
      });

      await expect(measurement.save()).rejects.toThrow();
    });

    it('should fail when reading value is missing', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            unit: 'mg/dL',
          },
        ],
      });

      await expect(measurement.save()).rejects.toThrow();
    });

    it('should set default timestamp for reading', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings[0].timestamp).toBeDefined();
      expect(savedMeasurement.readings[0].timestamp instanceof Date).toBe(true);
    });

    it('should allow custom timestamp for reading', async () => {
      const customTimestamp = new Date('2025-12-26T10:30:00Z');
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            timestamp: customTimestamp,
            value: 120,
            unit: 'mg/dL',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings[0].timestamp.getTime()).toBe(customTimestamp.getTime());
    });

    it('should support mixed value types (number, object)', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120, // Number
            unit: 'mg/dL',
          },
          {
            type: 'bloodPressure',
            value: { systolic: 120, diastolic: 80 }, // Object
            unit: 'mmHg',
          },
          {
            type: 'weight',
            value: 70.5, // Float
            unit: 'kg',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings[0].value).toBe(120);
      expect(savedMeasurement.readings[1].value.systolic).toBe(120);
      expect(savedMeasurement.readings[2].value).toBe(70.5);
    });

    it('should allow notes field in reading', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
            notes: 'fasting blood sugar',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings[0].notes).toBe('fasting blood sugar');
    });

    it('should allow empty notes field', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
          },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings[0].notes).toBeUndefined();
    });
  });

  // ========================
  // MULTIPLE READINGS TESTS
  // ========================
  describe('Multiple Readings in Single Measurement', () => {
    it('should store multiple readings in a single measurement', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          { type: 'glucose', value: 110, unit: 'mg/dL', notes: 'morning' },
          { type: 'weight', value: 70, unit: 'kg' },
          { type: 'heartRate', value: 72, unit: 'bpm' },
          { type: 'bloodPressure', value: { systolic: 120, diastolic: 80 }, unit: 'mmHg' },
          { type: 'spo2', value: 98, unit: '%' },
        ],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.readings).toHaveLength(5);
      expect(savedMeasurement.readings[0].type).toBe('glucose');
      expect(savedMeasurement.readings[4].type).toBe('spo2');
    });

    it('should add reading to existing measurement', async () => {
      let measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      measurement = await measurement.save();
      expect(measurement.readings).toHaveLength(1);

      measurement.readings.push({
        type: 'weight',
        value: 70,
        unit: 'kg',
      });

      measurement = await measurement.save();

      expect(measurement.readings).toHaveLength(2);
      expect(measurement.readings[1].type).toBe('weight');
    });

    it('should delete specific reading from measurement', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          { type: 'glucose', value: 120, unit: 'mg/dL' },
          { type: 'weight', value: 70, unit: 'kg' },
          { type: 'heartRate', value: 72, unit: 'bpm' },
        ],
      });

      const savedMeasurement = await measurement.save();
      const readingToDelete = savedMeasurement.readings[1];

      readingToDelete.deleteOne();
      await savedMeasurement.save();

      const updatedMeasurement = await Measurement.findById(savedMeasurement._id);
      expect(updatedMeasurement.readings).toHaveLength(2);
    });

    it('should update specific reading in measurement', async () => {
      let measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          { type: 'glucose', value: 120, unit: 'mg/dL' },
          { type: 'weight', value: 70, unit: 'kg' },
        ],
      });

      measurement = await measurement.save();
      const readingId = measurement.readings[0]._id;

      const reading = measurement.readings.id(readingId);
      reading.value = 130;
      reading.notes = 'after meal';

      await measurement.save();

      const updatedMeasurement = await Measurement.findById(measurement._id);
      expect(updatedMeasurement.readings[0].value).toBe(130);
      expect(updatedMeasurement.readings[0].notes).toBe('after meal');
    });
  });

  // ========================
  // TIMESTAMPS TESTS
  // ========================
  describe('Measurement Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      const savedMeasurement = await measurement.save();

      expect(savedMeasurement.createdAt).toBeDefined();
      expect(savedMeasurement.updatedAt).toBeDefined();
      expect(savedMeasurement.createdAt instanceof Date).toBe(true);
    });

    it('should update updatedAt when measurement is modified', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      const savedMeasurement = await measurement.save();
      const originalUpdatedAt = savedMeasurement.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      savedMeasurement.readings[0].value = 130;
      const updatedMeasurement = await savedMeasurement.save();

      expect(updatedMeasurement.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  // ========================
  // COMPOUND INDEX TESTS
  // ========================
  describe('Measurement Queries with Index', () => {
    beforeEach(async () => {
      // Create multiple measurements for testing
      await Measurement.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          readings: [{ type: 'glucose', value: 115, unit: 'mg/dL' }],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-24'),
          readings: [{ type: 'glucose', value: 125, unit: 'mg/dL' }],
        },
      ]);
    });

    it('should find measurements by userId and date', async () => {
      const measurements = await Measurement.find({
        userId: testUserId,
        date: new Date('2025-12-26'),
      });

      expect(measurements).toHaveLength(1);
      expect(measurements[0].readings[0].value).toBe(120);
    });

    it('should sort measurements by date in descending order', async () => {
      const measurements = await Measurement.find({ userId: testUserId }).sort({ date: -1 });

      expect(measurements).toHaveLength(3);
      expect(measurements[0].date).toEqual(new Date('2025-12-26'));
      expect(measurements[2].date).toEqual(new Date('2025-12-24'));
    });

    it('should find measurements by userId', async () => {
      const measurements = await Measurement.find({ userId: testUserId });

      expect(measurements).toHaveLength(3);
    });

    it('should find measurements within date range', async () => {
      const measurements = await Measurement.find({
        userId: testUserId,
        date: {
          $gte: new Date('2025-12-24'),
          $lte: new Date('2025-12-26'),
        },
      });

      expect(measurements).toHaveLength(3);
    });

    it('should find measurements by reading type', async () => {
      // Add a measurement with different reading type
      await Measurement.create({
        userId: testUserId,
        date: new Date('2025-12-23'),
        readings: [{ type: 'weight', value: 70, unit: 'kg' }],
      });

      const measurements = await Measurement.find({
        userId: testUserId,
        'readings.type': 'glucose',
      });

      expect(measurements).toHaveLength(3);
    });
  });

  // ========================
  // POPULATION TESTS
  // ========================
  describe('Measurement Population', () => {
    it('should populate userId with user details', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      await measurement.save();

      const populatedMeasurement = await Measurement.findById(measurement._id).populate(
        'userId',
        'name email'
      );

      expect(populatedMeasurement.userId.name).toBe('Test User');
      expect(populatedMeasurement.userId.email).toBe('testuser@example.com');
    });
  });

  // ========================
  // DUPLICATE MEASUREMENT TESTS
  // ========================
  describe('Duplicate Measurements for Same Date', () => {
    it('should allow multiple measurements for same user and date', async () => {
      const measurement1 = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL', timestamp: new Date('2025-12-26T08:00:00Z') }],
      });

      const measurement2 = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 140, unit: 'mg/dL', timestamp: new Date('2025-12-26T14:00:00Z') }],
      });

      const saved1 = await measurement1.save();
      const saved2 = await measurement2.save();

      const measurements = await Measurement.find({
        userId: testUserId,
        date: new Date('2025-12-26'),
      });

      expect(measurements).toHaveLength(2);
      expect(saved1._id).not.toEqual(saved2._id);
    });
  });

  // ========================
  // DELETE OPERATIONS TESTS
  // ========================
  describe('Delete Operations', () => {
    it('should delete measurement by ID', async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      const savedMeasurement = await measurement.save();
      await Measurement.findByIdAndDelete(savedMeasurement._id);

      const deletedMeasurement = await Measurement.findById(savedMeasurement._id);
      expect(deletedMeasurement).toBeNull();
    });

    it('should delete all measurements for a user', async () => {
      await Measurement.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          readings: [{ type: 'glucose', value: 115, unit: 'mg/dL' }],
        },
      ]);

      await Measurement.deleteMany({ userId: testUserId });

      const measurements = await Measurement.find({ userId: testUserId });
      expect(measurements).toHaveLength(0);
    });
  });

  // ========================
  // POST ENDPOINT TESTS
  // ========================
  describe('POST /api/measurements - Create Measurement', () => {
    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/measurements')
        .send({
          userId: fakeUserId.toString(),
          date: new Date('2025-12-26'),
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should create measurement when user exists', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/measurements')
        .send({
          userId: testUserId.toString(),
          date: '2025-12-26',
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Measurement recorded successfully');
      expect(response.body.data).toBeDefined();
    });

    it('should add readings to existing measurement for same user and date', async () => {
      const app = createApp();
      const date = '2025-12-26';

      // Create first measurement
      const response1 = await request(app)
        .post('/api/measurements')
        .send({
          userId: testUserId.toString(),
          date: date,
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        });

      expect(response1.status).toBe(201);

      // Add more readings to same date
      const response2 = await request(app)
        .post('/api/measurements')
        .send({
          userId: testUserId.toString(),
          date: date,
          readings: [{ type: 'weight', value: 70, unit: 'kg' }],
        });

      expect(response2.status).toBe(201);
      expect(response2.body.data.readings).toHaveLength(2);
    });
  });

  // ========================
  // GET ENDPOINTS TESTS
  // ========================
  describe('GET /api/measurements - Retrieve Measurements', () => {
    beforeEach(async () => {
      // Create test measurements
      await Measurement.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          readings: [{ type: 'glucose', value: 115, unit: 'mg/dL' }],
        },
      ]);
    });

    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/measurements/user/${fakeUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should get all measurements for a user', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/measurements/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get measurements sorted by date in descending order', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/measurements/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].date).toEqual(new Date('2025-12-26').toISOString());
    });

    it('should filter measurements by date range', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/measurements/user/${testUserId}`)
        .query({
          startDate: '2025-12-25',
          endDate: '2025-12-25',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should get measurements by type', async () => {
      const app = createApp();

      const response = await request(app).get(
        `/api/measurements/user/${testUserId}/type/glucose`
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get specific measurement by ID', async () => {
      const app = createApp();
      const measurement = await Measurement.findOne({ userId: testUserId });

      const response = await request(app).get(`/api/measurements/${measurement._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(measurement._id.toString());
    });

    it('should return 404 when measurement ID not found', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/measurements/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Measurement not found');
    });
  });

  // ========================
  // READING OPERATIONS TESTS
  // ========================
  describe('Reading Operations via Routes', () => {
    let measurementId;

    beforeEach(async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          { type: 'glucose', value: 120, unit: 'mg/dL' },
          { type: 'weight', value: 70, unit: 'kg' },
        ],
      });

      const savedMeasurement = await measurement.save();
      measurementId = savedMeasurement._id;
    });

    it('should add reading to measurement', async () => {
      const app = createApp();

      const response = await request(app)
        .post(`/api/measurements/${measurementId}/reading`)
        .send({
          reading: {
            type: 'heartRate',
            value: 72,
            unit: 'bpm',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.readings).toHaveLength(3);
    });

    it('should return 404 when adding reading to non-existent measurement', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/measurements/${fakeId}/reading`)
        .send({
          reading: {
            type: 'glucose',
            value: 120,
            unit: 'mg/dL',
          },
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Measurement not found');
    });

    it('should update specific reading', async () => {
      const app = createApp();
      const measurement = await Measurement.findById(measurementId);
      const readingId = measurement.readings[0]._id;

      const response = await request(app)
        .put(`/api/measurements/${measurementId}/reading/${readingId}`)
        .send({
          value: 130,
          notes: 'after meal',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.readings[0].value).toBe(130);
    });

    it('should delete specific reading', async () => {
      const app = createApp();
      const measurement = await Measurement.findById(measurementId);
      const readingId = measurement.readings[0]._id;

      const response = await request(app).delete(
        `/api/measurements/${measurementId}/reading/${readingId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.readings).toHaveLength(1);
    });
  });

  // ========================
  // DELETE ENDPOINT TESTS
  // ========================
  describe('DELETE /api/measurements', () => {
    let measurementId;

    beforeEach(async () => {
      const measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [{ type: 'glucose', value: 120, unit: 'mg/dL' }],
      });

      const savedMeasurement = await measurement.save();
      measurementId = savedMeasurement._id;
    });

    it('should delete measurement by ID', async () => {
      const app = createApp();

      const response = await request(app).delete(`/api/measurements/${measurementId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Measurement deleted successfully');

      const deletedMeasurement = await Measurement.findById(measurementId);
      expect(deletedMeasurement).toBeNull();
    });

    it('should return 404 when deleting non-existent measurement', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/measurements/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Measurement not found');
    });
  });

  // ========================
  // COMPREHENSIVE INTEGRATION TESTS
  // ========================
  describe('Measurement Workflow Integration', () => {
    it('should handle complete measurement lifecycle', async () => {
      // Create measurement
      let measurement = new Measurement({
        userId: testUserId,
        date: new Date('2025-12-26'),
        readings: [
          { type: 'glucose', value: 120, unit: 'mg/dL', notes: 'morning' },
        ],
      });

      measurement = await measurement.save();
      expect(measurement._id).toBeDefined();

      // Add multiple readings
      measurement.readings.push(
        { type: 'weight', value: 70, unit: 'kg' },
        { type: 'heartRate', value: 72, unit: 'bpm' }
      );
      measurement = await measurement.save();
      expect(measurement.readings).toHaveLength(3);

      // Update a reading
      const readingId = measurement.readings[0]._id;
      const reading = measurement.readings.id(readingId);
      reading.value = 125;
      measurement = await measurement.save();

      // Delete a reading
      measurement.readings[2].deleteOne();
      measurement = await measurement.save();

      // Verify final state
      const finalMeasurement = await Measurement.findById(measurement._id);
      expect(finalMeasurement.readings).toHaveLength(2);
      expect(finalMeasurement.readings[0].value).toBe(125);
    });

    it('should handle multiple measurements across different dates', async () => {
      const dates = [
        new Date('2025-12-26'),
        new Date('2025-12-25'),
        new Date('2025-12-24'),
        new Date('2025-12-23'),
      ];

      const measurements = await Measurement.insertMany(
        dates.map(date => ({
          userId: testUserId,
          date: date,
          readings: [
            { type: 'glucose', value: Math.floor(Math.random() * 50) + 100, unit: 'mg/dL' },
          ],
        }))
      );

      expect(measurements).toHaveLength(4);

      // Query across date range
      const queriedMeasurements = await Measurement.find({
        userId: testUserId,
        date: {
          $gte: new Date('2025-12-24'),
          $lte: new Date('2025-12-26'),
        },
      }).sort({ date: -1 });

      expect(queriedMeasurements).toHaveLength(3);
      expect(queriedMeasurements[0].date).toEqual(new Date('2025-12-26'));
    });

    it('should track measurement history for user', async () => {
      // Create measurements over multiple days
      const measurementData = [
        { date: '2025-12-26', glucose: 120 },
        { date: '2025-12-25', glucose: 115 },
        { date: '2025-12-24', glucose: 125 },
        { date: '2025-12-23', glucose: 130 },
      ];

      for (const data of measurementData) {
        await Measurement.create({
          userId: testUserId,
          date: new Date(data.date),
          readings: [{ type: 'glucose', value: data.glucose, unit: 'mg/dL' }],
        });
      }

      // Retrieve and verify history
      const history = await Measurement.find({ userId: testUserId })
        .sort({ date: -1 })
        .limit(7);

      expect(history).toHaveLength(4);
      expect(history[0].readings[0].value).toBe(120);
      expect(history[3].readings[0].value).toBe(130);
    });
  });
});
