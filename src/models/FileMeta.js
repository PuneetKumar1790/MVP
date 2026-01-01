const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: [true, 'Original name is required'],
        trim: true
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required'],
        enum: ['application/pdf', 'image/jpeg', 'image/png']
    },
    size: {
        type: Number,
        required: [true, 'File size is required']
    },
    blobUrl: {
        type: String,
        required: [true, 'Blob URL is required']
    },
    blobName: {
        type: String,
        required: [true, 'Blob name is required']
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Uploader is required'],
        index: true
    },
    relatedEntityType: {
        type: String,
        enum: ['grievance', 'leave', 'transfer', 'other'],
        required: true
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    }
}, {
    timestamps: true
});

// Index for querying files by entity
fileMetaSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

module.exports = mongoose.model('FileMeta', fileMetaSchema);
