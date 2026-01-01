const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        index: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'WFH'],
        required: [true, 'Status is required']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Compound index for unique attendance per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
