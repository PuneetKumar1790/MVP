const Leave = require('../models/Leave');
const logger = require('../utils/logger');

/**
 * @desc    Apply for leave
 * @route   POST /api/leave/apply
 * @access  Protected
 */
const applyLeave = async (req, res, next) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;

        // Check for overlapping leave requests
        const overlapping = await Leave.findOne({
            user: req.user._id,
            status: { $ne: 'rejected' },
            $or: [
                {
                    fromDate: { $lte: new Date(toDate) },
                    toDate: { $gte: new Date(fromDate) }
                }
            ]
        });

        if (overlapping) {
            return res.status(400).json({
                success: false,
                message: 'You have an overlapping leave request for this period'
            });
        }

        const leave = await Leave.create({
            user: req.user._id,
            leaveType,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            reason
        });

        logger.info('Leave applied', { userId: req.user._id, leaveId: leave._id, leaveType });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: { leave }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my leave requests
 * @route   GET /api/leave/my
 * @access  Protected
 */
const getMyLeaves = async (req, res, next) => {
    try {
        const { status, limit = 20 } = req.query;

        const query = { user: req.user._id };
        if (status) query.status = status;

        const leaves = await Leave.find(query)
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: { leaves }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all leave requests (HR/Dept Head)
 * @route   GET /api/leave
 * @access  HR, Department Head, Admin
 */
const getAllLeaves = async (req, res, next) => {
    try {
        const { status, department, limit = 50 } = req.query;

        const query = {};
        if (status) query.status = status;

        let leaves = await Leave.find(query)
            .populate('user', 'name email employeeId department')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Department heads can only see their department's leaves
        if (req.user.role === 'department_head') {
            leaves = leaves.filter(l => l.user?.department === req.user.department);
        } else if (department) {
            leaves = leaves.filter(l => l.user?.department === department);
        }

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: { leaves }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update leave status (approve/reject)
 * @route   PATCH /api/leave/:id/status
 * @access  HR, Department Head
 */
const updateLeaveStatus = async (req, res, next) => {
    try {
        const { status, approverRemarks } = req.body;

        const leave = await Leave.findById(req.params.id).populate('user', 'department');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Check if already processed
        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This leave request has already been processed'
            });
        }

        // Department heads can only approve their department's leaves
        if (req.user.role === 'department_head' && leave.user?.department !== req.user.department) {
            return res.status(403).json({
                success: false,
                message: 'You can only approve leaves from your department'
            });
        }

        leave.status = status;
        leave.approvedBy = req.user._id;
        leave.approverRemarks = approverRemarks;
        await leave.save();

        logger.info('Leave status updated', { leaveId: leave._id, status, approvedBy: req.user._id });

        res.status(200).json({
            success: true,
            message: `Leave ${status} successfully`,
            data: { leave }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};
