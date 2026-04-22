const express = require("express");
const diaryController = require("./diaryController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Diary
 *   description: Health diary management endpoints
 */

/**
 * @swagger
 * /api/diary:
 *   post:
 *     summary: Create a new diary entry
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               mood:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Diary entry created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/", diaryController.createDiaryEntry);

/**
 * @swagger
 * /api/diary/user/{userId}:
 *   get:
 *     summary: Get all diary entries for a user
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of diary entries
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/user/:userId", diaryController.getDiaryEntries);

/**
 * @swagger
 * /api/diary/user/{userId}/mood/{mood}:
 *   get:
 *     summary: Get diary entries by mood
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: mood
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Filtered diary entries
 */
router.get("/user/:userId/mood/:mood", diaryController.getDiaryEntriesByMood);

/**
 * @swagger
 * /api/diary/user/{userId}/tag/{tag}:
 *   get:
 *     summary: Get diary entries by tag
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered diary entries
 */
router.get("/user/:userId/tag/:tag", diaryController.getDiaryEntriesByTag);

/**
 * @swagger
 * /api/diary/user/{userId}/stats/mood:
 *   get:
 *     summary: Get mood statistics for a user
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mood statistics object
 */
router.get("/user/:userId/stats/mood", diaryController.getMoodStatistics);

/**
 * @swagger
 * /api/diary/{id}:
 *   get:
 *     summary: Get a specific diary entry by ID
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diary entry details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", diaryController.getDiaryEntryById);

/**
 * @swagger
 * /api/diary/{id}:
 *   put:
 *     summary: Update a diary entry
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               mood:
 *                 type: string
 *     responses:
 *       200:
 *         description: Diary entry updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put("/:id", diaryController.updateDiaryEntry);

/**
 * @swagger
 * /api/diary/{id}:
 *   delete:
 *     summary: Delete a diary entry
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diary entry deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", diaryController.deleteDiaryEntry);

module.exports = router;
