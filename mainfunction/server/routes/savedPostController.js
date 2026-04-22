const SavedPost = require('../models/SavedPost');
const Article = require('../models/Article');

// Save a post
exports.savePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { articleId } = req.body;

        if (!articleId) {
            return res.status(400).json({ success: false, message: "Article ID is required" });
        }

        // Check if already saved
        const existing = await SavedPost.findOne({ userId, articleId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Post already saved" });
        }

        const savedPost = new SavedPost({
            userId,
            articleId
        });

        await savedPost.save();

        res.status(201).json({ success: true, message: "Post saved successfully", data: savedPost });
    } catch (error) {
        console.error("Error saving post:", error);
        res.status(500).json({ success: false, message: "Error saving post", error: error.message });
    }
};

// Unsave a post
exports.unsavePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { articleId } = req.params;

        const deleted = await SavedPost.findOneAndDelete({ userId, articleId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Saved post not found" });
        }

        res.status(200).json({ success: true, message: "Post removed from saved list" });
    } catch (error) {
        console.error("Error unsaving post:", error);
        res.status(500).json({ success: false, message: "Error unsaving post", error: error.message });
    }
};

// Get all saved posts for a user
exports.getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const savedPosts = await SavedPost.find({ userId })
            .populate('articleId') // Populate the full article details
            .sort({ savedAt: -1 });

        // Filter out any null articles (in case original article was deleted)
        const validPosts = savedPosts
            .filter(post => post.articleId)
            .map(post => ({
                ...post.articleId.toObject(),
                savedAt: post.savedAt,
                savedPostId: post._id
            }));

        res.status(200).json({ success: true, data: validPosts });
    } catch (error) {
        console.error("Error fetching saved posts:", error);
        res.status(500).json({ success: false, message: "Error fetching saved posts", error: error.message });
    }
};

// Get IDs of all saved posts (for efficient checking on frontend)
exports.getSavedPostIds = async (req, res) => {
    try {
        const userId = req.user.id;

        const savedPosts = await SavedPost.find({ userId }).select('articleId');
        const ids = savedPosts.map(post => post.articleId.toString());

        res.status(200).json({ success: true, data: ids });
    } catch (error) {
        console.error("Error fetching saved post IDs:", error);
        res.status(500).json({ success: false, message: "Error fetching saved post IDs", error: error.message });
    }
};
