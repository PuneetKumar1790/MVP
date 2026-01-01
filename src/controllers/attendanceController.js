const Attendance = require('../models/Attendance');
const logger = require('../utils/logger');

/**
 * @desc    Mark attendance
 * @route   POST /api/attendance/mark
 * @access  Protected
 */
const markAttendance = async (req, res, next) => {
    try {
        const { status, date, remarks } = req.body;

        // Use provided date or today
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Check if attendance already marked for this date
        const existingAttendance = await Attendance.findOne({
            user: req.user._id,
            date: attendanceDate
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this date'
            });
        }

        const attendance = await Attendance.create({
            user: req.user._id,
            date: attendanceDate,
            status,
            remarks,
            timestamp: new Date()
        });

        logger.info('Attendance marked', { userId: req.user._id, date: attendanceDate, status });

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my attendance records
 * @route   GET /api/attendance/my
 * @access  Protected
 */
const getMyAttendance = async (req, res, next) => {
    try {
        const { startDate, endDate, limit = 30 } = req.query;

        const query = { user: req.user._id };

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all attendance records (HR/Admin)
 * @route   GET /api/attendance
 * @access  HR, Admin
 */
const getAllAttendance = async (req, res, next) => {
    try {
        const { startDate, endDate, userId, department, limit = 100 } = req.query;

        const query = {};

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // User filter
        if (userId) {
            query.user = userId;
        }

        let attendance = await Attendance.find(query)
            .populate('user', 'name email employeeId department')
            .sort({ date: -1 })
            .limit(parseInt(limit));

        // Filter by department if specified
        if (department) {
            attendance = attendance.filter(a => a.user?.department === department);
        }

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getAllAttendance
};
