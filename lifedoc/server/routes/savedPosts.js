const express = require('express');
const router = express.Router();
const savedPostController = require('./savedPostController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', savedPostController.savePost);
router.delete('/:articleId', savedPostController.unsavePost);
router.get('/', savedPostController.getSavedPosts);
router.get('/ids', savedPostController.getSavedPostIds);

module.exports = router;
