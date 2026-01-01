const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    currentDepartment: {
        type: String,
        required: [true, 'Current department is required'],
        trim: true
    },
    requestedDepartment: {
        type: String,
        required: [true, 'Requested department is required'],
        trim: true
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        minlength: [10, 'Reason must be at least 10 characters'],
        maxlength: [2000, 'Reason cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approverRemarks: {
        type: String,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    effectiveDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for querying by status
transferSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transfer', transferSchema);
