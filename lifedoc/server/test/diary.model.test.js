const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const Diary = require('../models/Diary');
const User = require('../models/User');
const diaryRoutes = require('../routes/diary');

let mongoServer;

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/diary', diaryRoutes);
  return app;
};

describe('Diary Model & Routes', () => {
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
    await Diary.deleteMany({});
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
  // DIARY MODEL TESTS
  // ========================
  describe('Diary Model Schema', () => {
    it('should create a diary entry with all fields', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        rawText: 'Had a good day today, went for a run and felt energetic.',
        summary: 'Completed morning exercise routine and felt positive',
        mood: 'energetic',
        tags: ['exercise', 'health', 'positive'],
      });

      const savedEntry = await entry.save();

      expect(savedEntry._id).toBeDefined();
      expect(savedEntry.userId.toString()).toBe(testUserId.toString());
      expect(savedEntry.date).toEqual(new Date('2025-12-26'));
      expect(savedEntry.summary).toBe('Completed morning exercise routine and felt positive');
      expect(savedEntry.mood).toBe('energetic');
      expect(savedEntry.tags).toHaveLength(3);
    });

    it('should fail to create diary entry without userId', async () => {
      const entry = new Diary({
        date: new Date('2025-12-26'),
        summary: 'Test summary',
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should fail to create diary entry without date', async () => {
      const entry = new Diary({
        userId: testUserId,
        summary: 'Test summary',
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should fail to create diary entry without summary', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should allow diary entry without rawText', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary of the day',
      });

      const savedEntry = await entry.save();

      expect(savedEntry._id).toBeDefined();
      expect(savedEntry.rawText).toBeUndefined();
    });

    it('should allow diary entry without mood', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary of the day',
      });

      const savedEntry = await entry.save();

      expect(savedEntry.mood).toBeUndefined();
    });

    it('should allow diary entry without tags', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary of the day',
      });

      const savedEntry = await entry.save();

      expect(savedEntry.tags).toBeUndefined();
    });
  });

  // ========================
  // MOOD ENUM TESTS
  // ========================
  describe('Mood Enum Validation', () => {
    it('should accept valid mood values', async () => {
      const validMoods = ['happy', 'neutral', 'stressed', 'sad', 'anxious', 'energetic'];

      for (const mood of validMoods) {
        const entry = new Diary({
          userId: testUserId,
          date: new Date(`2025-12-${20 + validMoods.indexOf(mood)}`),
          summary: `Entry with ${mood} mood`,
          mood: mood,
        });

        const savedEntry = await entry.save();
        expect(savedEntry.mood).toBe(mood);
      }
    });

    it('should reject invalid mood value', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test summary',
        mood: 'invalidMood',
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should handle case-sensitive mood values', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test summary',
        mood: 'Happy', // Wrong case
      });

      await expect(entry.save()).rejects.toThrow();
    });
  });

  // ========================
  // TAGS TESTS
  // ========================
  describe('Tags Array', () => {
    it('should store multiple tags', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Entry with multiple tags',
        tags: ['exercise', 'diet', 'sleep', 'work', 'stress'],
      });

      const savedEntry = await entry.save();

      expect(savedEntry.tags).toHaveLength(5);
      expect(savedEntry.tags).toContain('exercise');
      expect(savedEntry.tags).toContain('stress');
    });

    it('should handle single tag', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Entry with single tag',
        tags: ['health'],
      });

      const savedEntry = await entry.save();

      expect(savedEntry.tags).toHaveLength(1);
      expect(savedEntry.tags[0]).toBe('health');
    });

    it('should allow empty tags array', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Entry with no tags',
        tags: [],
      });

      const savedEntry = await entry.save();

      expect(savedEntry.tags).toHaveLength(0);
    });

    it('should support custom tag strings', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Entry with custom tags',
        tags: ['custom-tag-1', 'another-tag', 'tag with spaces'],
      });

      const savedEntry = await entry.save();

      expect(savedEntry.tags).toContain('custom-tag-1');
      expect(savedEntry.tags).toContain('tag with spaces');
    });
  });

  // ========================
  // RAW TEXT TESTS
  // ========================
  describe('Raw Text Field', () => {
    it('should store long raw text', async () => {
      const longText = 'This is a long diary entry. '.repeat(100);

      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary of long entry',
        rawText: longText,
      });

      const savedEntry = await entry.save();

      expect(savedEntry.rawText).toBe(longText);
      expect(savedEntry.rawText.length).toBeGreaterThan(1000);
    });

    it('should allow empty rawText', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary',
        rawText: '',
      });

      const savedEntry = await entry.save();

      expect(savedEntry.rawText).toBe('');
    });

    it('should preserve special characters in rawText', async () => {
      const specialText = "Today was great! I felt happy :) and excited about the future #blessed";

      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Summary',
        rawText: specialText,
      });

      const savedEntry = await entry.save();

      expect(savedEntry.rawText).toBe(specialText);
    });
  });

  // ========================
  // TIMESTAMPS TESTS
  // ========================
  describe('Diary Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test entry',
      });

      const savedEntry = await entry.save();

      expect(savedEntry.createdAt).toBeDefined();
      expect(savedEntry.updatedAt).toBeDefined();
      expect(savedEntry.createdAt instanceof Date).toBe(true);
    });

    it('should update updatedAt when entry is modified', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Original summary',
      });

      const savedEntry = await entry.save();
      const originalUpdatedAt = savedEntry.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      savedEntry.summary = 'Updated summary';
      const updatedEntry = await savedEntry.save();

      expect(updatedEntry.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  // ========================
  // COMPOUND INDEX TESTS
  // ========================
  describe('Diary Queries', () => {
    beforeEach(async () => {
      await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'Today was great',
          mood: 'happy',
          tags: ['exercise', 'health'],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'A stressful day',
          mood: 'stressed',
          tags: ['work', 'stress'],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-24'),
          summary: 'Neutral day',
          mood: 'neutral',
          tags: ['routine'],
        },
      ]);
    });

    it('should find diary entry by userId and date', async () => {
      const entries = await Diary.find({
        userId: testUserId,
        date: new Date('2025-12-26'),
      });

      expect(entries).toHaveLength(1);
      expect(entries[0].summary).toBe('Today was great');
    });

    it('should sort diary entries by date in descending order', async () => {
      const entries = await Diary.find({ userId: testUserId }).sort({ date: -1 });

      expect(entries).toHaveLength(3);
      expect(entries[0].date).toEqual(new Date('2025-12-26'));
      expect(entries[2].date).toEqual(new Date('2025-12-24'));
    });

    it('should find entries within date range', async () => {
      const entries = await Diary.find({
        userId: testUserId,
        date: {
          $gte: new Date('2025-12-24'),
          $lte: new Date('2025-12-26'),
        },
      });

      expect(entries).toHaveLength(3);
    });

    it('should find entries by mood', async () => {
      const happyEntries = await Diary.find({
        userId: testUserId,
        mood: 'happy',
      });

      expect(happyEntries).toHaveLength(1);
      expect(happyEntries[0].summary).toBe('Today was great');
    });

    it('should find entries by tags', async () => {
      const entries = await Diary.find({
        userId: testUserId,
        tags: 'exercise',
      });

      expect(entries).toHaveLength(1);
      expect(entries[0].tags).toContain('exercise');
    });
  });

  // ========================
  // POPULATION TESTS
  // ========================
  describe('Diary Population', () => {
    it('should populate userId with user details', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test entry',
      });

      await entry.save();

      const populatedEntry = await Diary.findById(entry._id).populate(
        'userId',
        'name email'
      );

      expect(populatedEntry.userId.name).toBe('Test User');
      expect(populatedEntry.userId.email).toBe('testuser@example.com');
    });
  });

  // ========================
  // DELETE OPERATIONS TESTS
  // ========================
  describe('Delete Operations', () => {
    it('should delete diary entry by ID', async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test entry',
      });

      const savedEntry = await entry.save();
      await Diary.findByIdAndDelete(savedEntry._id);

      const deletedEntry = await Diary.findById(savedEntry._id);
      expect(deletedEntry).toBeNull();
    });

    it('should delete all entries for a user', async () => {
      await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'Entry 1',
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'Entry 2',
        },
      ]);

      await Diary.deleteMany({ userId: testUserId });

      const entries = await Diary.find({ userId: testUserId });
      expect(entries).toHaveLength(0);
    });
  });

  // ========================
  // POST ENDPOINT TESTS
  // ========================
  describe('POST /api/diary - Create Entry', () => {
    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/diary')
        .send({
          userId: fakeUserId.toString(),
          date: '2025-12-26',
          summary: 'Test summary',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should create diary entry when user exists', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/diary')
        .send({
          userId: testUserId.toString(),
          date: '2025-12-26',
          rawText: 'Had a great day',
          summary: 'Positive day with exercise',
          mood: 'happy',
          tags: ['exercise', 'health'],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Diary entry created successfully');
      expect(response.body.data.mood).toBe('happy');
    });
  });

  // ========================
  // GET ENDPOINT TESTS
  // ========================
  describe('GET /api/diary - Retrieve Entries', () => {
    beforeEach(async () => {
      await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'Great day',
          mood: 'happy',
          tags: ['exercise'],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'Stressful day',
          mood: 'stressed',
          tags: ['work'],
        },
      ]);
    });

    it('should return 404 when user does not exist', async () => {
      const app = createApp();
      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/diary/user/${fakeUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should get all diary entries for a user', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/diary/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should get entries sorted by date in descending order', async () => {
      const app = createApp();

      const response = await request(app).get(`/api/diary/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(new Date(response.body.data[0].date)).toEqual(new Date('2025-12-26'));
    });

    it('should filter entries by date range', async () => {
      const app = createApp();

      const response = await request(app)
        .get(`/api/diary/user/${testUserId}`)
        .query({
          startDate: '2025-12-25',
          endDate: '2025-12-25',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].summary).toBe('Stressful day');
    });

    it('should get specific entry by ID', async () => {
      const app = createApp();
      const entry = await Diary.findOne({ userId: testUserId });

      const response = await request(app).get(`/api/diary/${entry._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(entry._id.toString());
    });

    it('should return 404 when entry ID not found', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/diary/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Diary entry not found');
    });
  });

  // ========================
  // PUT ENDPOINT TESTS
  // ========================
  describe('PUT /api/diary/:id - Update Entry', () => {
    let entryId;

    beforeEach(async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Original summary',
        mood: 'neutral',
      });

      const savedEntry = await entry.save();
      entryId = savedEntry._id;
    });

    it('should update diary entry successfully', async () => {
      const app = createApp();

      const response = await request(app)
        .put(`/api/diary/${entryId}`)
        .send({
          summary: 'Updated summary',
          mood: 'happy',
          tags: ['updated', 'tags'],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Diary entry updated successfully');
      expect(response.body.data.summary).toBe('Updated summary');
      expect(response.body.data.mood).toBe('happy');
    });

    it('should return 404 when updating non-existent entry', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/diary/${fakeId}`)
        .send({ summary: 'New summary' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Diary entry not found');
    });

    it('should allow partial updates', async () => {
      const app = createApp();

      const response = await request(app)
        .put(`/api/diary/${entryId}`)
        .send({ mood: 'stressed' });

      expect(response.status).toBe(200);
      expect(response.body.data.mood).toBe('stressed');
      expect(response.body.data.summary).toBe('Original summary');
    });
  });

  // ========================
  // DELETE ENDPOINT TESTS
  // ========================
  describe('DELETE /api/diary/:id', () => {
    let entryId;

    beforeEach(async () => {
      const entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        summary: 'Test entry',
      });

      const savedEntry = await entry.save();
      entryId = savedEntry._id;
    });

    it('should delete diary entry by ID', async () => {
      const app = createApp();

      const response = await request(app).delete(`/api/diary/${entryId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Diary entry deleted successfully');

      const deletedEntry = await Diary.findById(entryId);
      expect(deletedEntry).toBeNull();
    });

    it('should return 404 when deleting non-existent entry', async () => {
      const app = createApp();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/diary/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Diary entry not found');
    });
  });

  // ========================
  // INTEGRATION TESTS
  // ========================
  describe('Diary Workflow Integration', () => {
    it('should handle complete diary entry lifecycle', async () => {
      // Create entry
      let entry = new Diary({
        userId: testUserId,
        date: new Date('2025-12-26'),
        rawText: 'Had a busy day at work',
        summary: 'Productive day',
        mood: 'energetic',
        tags: ['work', 'productivity'],
      });

      entry = await entry.save();
      expect(entry._id).toBeDefined();

      // Update entry
      entry.summary = 'Very productive day with accomplishments';
      entry.tags.push('achievement');
      entry = await entry.save();

      // Verify updates
      const updatedEntry = await Diary.findById(entry._id);
      expect(updatedEntry.summary).toBe('Very productive day with accomplishments');
      expect(updatedEntry.tags).toHaveLength(3);

      // Delete entry
      await Diary.findByIdAndDelete(entry._id);
      const deletedEntry = await Diary.findById(entry._id);
      expect(deletedEntry).toBeNull();
    });

    it('should track mood patterns over time', async () => {
      const entries = await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'Great day',
          mood: 'happy',
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'Good day',
          mood: 'energetic',
        },
        {
          userId: testUserId,
          date: new Date('2025-12-24'),
          summary: 'Busy day',
          mood: 'stressed',
        },
        {
          userId: testUserId,
          date: new Date('2025-12-23'),
          summary: 'Relaxed day',
          mood: 'neutral',
        },
      ]);

      expect(entries).toHaveLength(4);

      // Query mood patterns
      const happyMoodDays = await Diary.find({
        userId: testUserId,
        mood: { $in: ['happy', 'energetic'] },
      }).sort({ date: -1 });

      expect(happyMoodDays).toHaveLength(2);
    });

    it('should organize entries by tags', async () => {
      const entries = await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'Ran 5km',
          tags: ['exercise', 'health'],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'Yoga session',
          tags: ['exercise', 'relaxation'],
        },
        {
          userId: testUserId,
          date: new Date('2025-12-24'),
          summary: 'Work project',
          tags: ['work', 'productivity'],
        },
      ]);

      expect(entries).toHaveLength(3);

      // Query by exercise tag
      const exerciseEntries = await Diary.find({
        userId: testUserId,
        tags: 'exercise',
      }).sort({ date: -1 });

      expect(exerciseEntries).toHaveLength(2);
    });

    it('should handle multiple users with separate entries', async () => {
      // Create second user
      const user2 = new User({
        name: 'Another User',
        email: 'anotheruser@example.com',
        password: 'password123',
        isVerified: true,
      });
      const savedUser2 = await user2.save();

      // Create entries for both users
      await Diary.insertMany([
        {
          userId: testUserId,
          date: new Date('2025-12-26'),
          summary: 'User 1 entry',
          mood: 'happy',
        },
        {
          userId: testUserId,
          date: new Date('2025-12-25'),
          summary: 'User 1 entry 2',
          mood: 'neutral',
        },
        {
          userId: savedUser2._id,
          date: new Date('2025-12-26'),
          summary: 'User 2 entry',
          mood: 'stressed',
        },
      ]);

      // Verify entries are isolated by user
      const user1Entries = await Diary.find({ userId: testUserId });
      const user2Entries = await Diary.find({ userId: savedUser2._id });

      expect(user1Entries).toHaveLength(2);
      expect(user2Entries).toHaveLength(1);
      expect(user2Entries[0].summary).toBe('User 2 entry');
    });

    it('should support bulk tagging and mood analysis', async () => {
      // Create entries across a week
      const weekEntries = await Diary.insertMany(
        Array.from({ length: 7 }, (_, i) => ({
          userId: testUserId,
          date: new Date(`2025-12-${26 - i}`),
          summary: `Day ${7 - i} summary`,
          mood: ['happy', 'neutral', 'stressed', 'anxious', 'energetic', 'sad', 'happy'][i],
          tags: ['daily', `day${7 - i}`],
        }))
      );

      expect(weekEntries).toHaveLength(7);

      // Analyze moods
      const stressedDays = await Diary.find({
        userId: testUserId,
        mood: 'stressed',
      });

      const dailyEntries = await Diary.find({
        userId: testUserId,
        tags: 'daily',
      });

      expect(stressedDays).toHaveLength(1);
      expect(dailyEntries).toHaveLength(7);
    });
  });
});
