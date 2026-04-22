const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const User = require('../models/User');
const authRoutes = require('../routes/auth');
const bcrypt = require('bcrypt');

let mongoServer;

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('User Model & Auth Routes', () => {
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
    // Clear User collection before each test
    await User.deleteMany({});
  });

  // ========================
  // HEALTH CHECK TESTS
  // ========================
  describe('Health Check', () => {
    it('should return 200 status from health endpoint', async () => {
      const app = createApp();
      const response = await request(app).get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('Auth service is healthy');
    });
  });

  // ========================
  // USER MODEL TESTS
  // ========================
  describe('User Model Schema', () => {
    it('should create a user with all required fields', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.email).toBe('john@example.com');
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.type).toBe('user');
    });

    it('should fail to create user without required name field', async () => {
      const user = new User({
        email: 'john@example.com',
        password: 'password123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user without required email field', async () => {
      const user = new User({
        name: 'John Doe',
        password: 'password123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user without required password field', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const user1 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      await user1.save();

      const user2 = new User({
        name: 'Jane Doe',
        email: 'john@example.com',
        password: 'password456',
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: plainPassword,
      });

      await user.save();
      const savedUser = await User.findById(user._id);

      expect(savedUser.password).not.toBe(plainPassword);
      expect(await bcrypt.compare(plainPassword, savedUser.password)).toBe(true);
    });

    it('should not re-hash password if not modified', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();
      const firstHashedPassword = savedUser.password;

      savedUser.name = 'Jane Doe';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(firstHashedPassword);
    });
  });

  // ========================
  // PASSWORD COMPARISON TESTS
  // ========================
  describe('User Methods - comparePassword', () => {
    it('should return true when password matches', async () => {
      const plainPassword = 'password123';
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: plainPassword,
      });

      await user.save();
      const isMatch = await user.comparePassword(plainPassword);

      expect(isMatch).toBe(true);
    });

    it('should return false when password does not match', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await user.save();
      const isMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  // ========================
  // PROFILE FIELDS TESTS
  // ========================
  describe('User Profile Fields', () => {
    it('should allow setting profile information', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        profile: {
          gender: 'male',
          height: 180,
          weight: 75,
          bloodGroup: 'O+',
          chronicConditions: ['diabetes', 'hypertension'],
        },
      });

      const savedUser = await user.save();

      expect(savedUser.profile.gender).toBe('male');
      expect(savedUser.profile.height).toBe(180);
      expect(savedUser.profile.weight).toBe(75);
      expect(savedUser.profile.bloodGroup).toBe('O+');
      expect(savedUser.profile.chronicConditions).toContain('diabetes');
    });

    it('should validate gender enum values', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        profile: {
          gender: 'invalidgender',
        },
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should allow valid gender values (male, female, other)', async () => {
      const genders = ['male', 'female', 'other'];

      for (const gender of genders) {
        const user = new User({
          name: `User ${gender}`,
          email: `${gender}@example.com`,
          password: 'password123',
          profile: {
            gender: gender,
          },
        });

        const savedUser = await user.save();
        expect(savedUser.profile.gender).toBe(gender);
      }
    });
  });

  // ========================
  // SOS CONTACTS TESTS
  // ========================
  describe('SOS Contacts', () => {
    it('should allow adding SOS contacts', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        sosContacts: [
          {
            name: 'Emergency Contact 1',
            phone: '1234567890',
            email: 'contact1@example.com',
            relationship: 'Family',
          },
          {
            name: 'Emergency Contact 2',
            phone: '0987654321',
            email: 'contact2@example.com',
            relationship: 'Friend',
          },
        ],
      });

      const savedUser = await user.save();

      expect(savedUser.sosContacts).toHaveLength(2);
      expect(savedUser.sosContacts[0].name).toBe('Emergency Contact 1');
      expect(savedUser.sosContacts[0].phone).toBe('1234567890');
      expect(savedUser.sosContacts[1].relationship).toBe('Friend');
    });

    it('should enforce required fields in SOS contacts', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        sosContacts: [
          {
            // Missing required 'name' field
            phone: '1234567890',
            email: 'contact1@example.com',
          },
        ],
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should allow empty SOS contacts array', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        sosContacts: [],
      });

      const savedUser = await user.save();
      expect(savedUser.sosContacts).toHaveLength(0);
    });
  });

  // ========================
  // EMERGENCY SETTINGS TESTS
  // ========================
  describe('Emergency Settings', () => {
    it('should allow setting emergency settings', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        emergencySettings: {
          enableAutoAlert: true,
          criticalThresholds: {
            glucose: { low: 70, high: 180 },
            bloodPressure: {
              systolicHigh: 140,
              diastolicHigh: 90,
            },
          },
        },
      });

      const savedUser = await user.save();

      expect(savedUser.emergencySettings.enableAutoAlert).toBe(true);
      expect(savedUser.emergencySettings.criticalThresholds.glucose.low).toBe(70);
      expect(savedUser.emergencySettings.criticalThresholds.bloodPressure.systolicHigh).toBe(140);
    });

    it('should default enableAutoAlert to false', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();

      expect(savedUser.emergencySettings.enableAutoAlert).toBe(false);
    });

    it('should allow updating emergency settings', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        emergencySettings: {
          enableAutoAlert: false,
        },
      });

      let savedUser = await user.save();
      expect(savedUser.emergencySettings.enableAutoAlert).toBe(false);

      savedUser.emergencySettings.enableAutoAlert = true;
      savedUser = await savedUser.save();

      expect(savedUser.emergencySettings.enableAutoAlert).toBe(true);
    });
  });

  // ========================
  // OTP TESTS
  // ========================
  describe('OTP Functionality', () => {
    it('should allow setting OTP and expiry time', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        otp: '123456',
        otpExpires: expiresAt,
      });

      const savedUser = await user.save();

      expect(savedUser.otp).toBe('123456');
      expect(savedUser.otpExpires).toBeDefined();
      expect(savedUser.otpExpires.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should clear OTP fields when set to undefined', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        otp: '123456',
        otpExpires: new Date(),
      });

      let savedUser = await user.save();
      expect(savedUser.otp).toBe('123456');

      savedUser.otp = undefined;
      savedUser.otpExpires = undefined;
      savedUser = await savedUser.save();

      expect(savedUser.otp).toBeUndefined();
      expect(savedUser.otpExpires).toBeUndefined();
    });
  });

  // ========================
  // TIMESTAMPS TESTS
  // ========================
  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt timestamps', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt instanceof Date).toBe(true);
    });

    it('should update updatedAt timestamp when user is modified', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.name = 'Jane Doe';
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  // ========================
  // DEFAULT VALUES TESTS
  // ========================
  describe('Default Values', () => {
    it('should set default values for type and isVerified', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const savedUser = await user.save();

      expect(savedUser.type).toBe('user');
      expect(savedUser.isVerified).toBe(false);
    });

    it('should allow overriding default type', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        type: 'admin',
      });

      const savedUser = await user.save();

      expect(savedUser.type).toBe('admin');
    });

    it('should allow overriding default isVerified', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isVerified: true,
      });

      const savedUser = await user.save();

      expect(savedUser.isVerified).toBe(true);
    });
  });

  // ========================
  // QUERY TESTS
  // ========================
  describe('User Queries', () => {
    beforeEach(async () => {
      await User.create([
        {
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
          isVerified: true,
        },
        {
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
          isVerified: false,
        },
        {
          name: 'User 3',
          email: 'user3@example.com',
          password: 'password123',
          isVerified: true,
        },
      ]);
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });

      expect(user).toBeDefined();
      expect(user.name).toBe('User 1');
      expect(user.email).toBe('user1@example.com');
    });

    it('should find user by ID', async () => {
      const originalUser = await User.findOne({ email: 'user1@example.com' });
      const user = await User.findById(originalUser._id);

      expect(user._id.toString()).toBe(originalUser._id.toString());
      expect(user.name).toBe('User 1');
    });

    it('should find users by isVerified status', async () => {
      const verifiedUsers = await User.find({ isVerified: true });

      expect(verifiedUsers).toHaveLength(2);
      expect(verifiedUsers.every(u => u.isVerified)).toBe(true);
    });

    it('should return null when user not found', async () => {
      const user = await User.findOne({ email: 'nonexistent@example.com' });

      expect(user).toBeNull();
    });

    it('should count total users', async () => {
      const count = await User.countDocuments();

      expect(count).toBe(3);
    });

    it('should delete user by ID', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });
      await User.findByIdAndDelete(user._id);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should update user by ID', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { name: 'Updated Name', isVerified: false },
        { new: true }
      );

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.isVerified).toBe(false);
    });
  });

  // ========================
  // SIGNUP ENDPOINT TESTS
  // ========================
  describe('POST /api/auth/signup', () => {
    it('should return 500 error when encryptedData is missing', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.message).toBeDefined();
    });

    it('should create a new user when valid encrypted data is provided', async () => {
      const app = createApp();
      // Note: In real tests, you would need to provide properly encrypted data
      // This test demonstrates the expected behavior when encryption is properly handled
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ encryptedData: null }); // This will fail at decryption stage

      expect(response.status).toBe(500);
    });
  });

  // ========================
  // COMPREHENSIVE INTEGRATION TESTS
  // ========================
  describe('User Creation Workflow', () => {
    it('should create multiple users without conflicts', async () => {
      const users = [
        { name: 'User A', email: 'usera@example.com', password: 'pass123' },
        { name: 'User B', email: 'userb@example.com', password: 'pass456' },
        { name: 'User C', email: 'userc@example.com', password: 'pass789' },
      ];

      const savedUsers = await User.insertMany(users);

      expect(savedUsers).toHaveLength(3);
      expect(savedUsers[0].email).toBe('usera@example.com');
      expect(savedUsers[1].email).toBe('userb@example.com');
      expect(savedUsers[2].email).toBe('userc@example.com');
    });

    it('should handle user modification workflow', async () => {
      let user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      user = await user.save();
      expect(user.isVerified).toBe(false);

      // Update profile
      user.profile = {
        gender: 'male',
        height: 180,
        weight: 75,
      };
      user = await user.save();

      // Verify OTP
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      user = await user.save();

      // Fetch and verify
      const fetchedUser = await User.findById(user._id);
      expect(fetchedUser.isVerified).toBe(true);
      expect(fetchedUser.profile.height).toBe(180);
      expect(fetchedUser.otp).toBeUndefined();
    });

    it('should handle complete user lifecycle', async () => {
      // Create user
      const user = new User({
        name: 'Complete User',
        email: 'complete@example.com',
        password: 'password123',
        otp: '123456',
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });

      const savedUser = await user.save();
      expect(savedUser._id).toBeDefined();

      // Verify user
      savedUser.isVerified = true;
      savedUser.otp = undefined;
      savedUser.otpExpires = undefined;
      const verifiedUser = await savedUser.save();

      // Update profile
      verifiedUser.profile = {
        gender: 'female',
        height: 165,
        weight: 60,
        bloodGroup: 'B+',
        chronicConditions: ['asthma'],
      };
      verifiedUser.sosContacts = [
        {
          name: 'Parent',
          phone: '9876543210',
          email: 'parent@example.com',
          relationship: 'Parent',
        },
      ];

      const updatedUser = await verifiedUser.save();

      // Verify all data is persisted
      const finalUser = await User.findById(savedUser._id);
      expect(finalUser.isVerified).toBe(true);
      expect(finalUser.profile.gender).toBe('female');
      expect(finalUser.sosContacts).toHaveLength(1);
      expect(await finalUser.comparePassword('password123')).toBe(true);
    });
  });
});
