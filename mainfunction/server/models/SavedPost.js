const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can only save an article once
savedPostSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('SavedPost', savedPostSchema);
