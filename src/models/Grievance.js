const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    category: {
        type: String,
        enum: ['harassment', 'discrimination', 'workplace_safety', 'salary', 'benefits', 'management', 'other'],
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    response: {
        type: String,
        maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    },
    fileUrl: {
        type: String
    },
    fileMeta: {
        fileName: String,
        mimeType: String,
        size: Number,
        blobName: String
    }
}, {
    timestamps: true
});

// Index for querying by status
grievanceSchema.index({ status: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Grievance', grievanceSchema);
