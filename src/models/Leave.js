const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    leaveType: {
        type: String,
        enum: ['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid'],
        required: [true, 'Leave type is required']
    },
    fromDate: {
        type: Date,
        required: [true, 'From date is required']
    },
    toDate: {
        type: Date,
        required: [true, 'To date is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        minlength: [5, 'Reason must be at least 5 characters'],
        maxlength: [1000, 'Reason cannot exceed 1000 characters']
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
    }
}, {
    timestamps: true
});

// Index for querying leaves by status
leaveSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Leave', leaveSchema);
