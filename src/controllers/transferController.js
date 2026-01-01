const Transfer = require('../models/Transfer');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Request transfer
 * @route   POST /api/transfers/request
 * @access  Protected
 */
const requestTransfer = async (req, res, next) => {
    try {
        const { requestedDepartment, reason } = req.body;

        // Check for pending transfer request
        const pendingTransfer = await Transfer.findOne({
            user: req.user._id,
            status: 'pending'
        });

        if (pendingTransfer) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending transfer request'
            });
        }

        // Check if requesting same department
        if (req.user.department === requestedDepartment) {
            return res.status(400).json({
                success: false,
                message: 'You are already in this department'
            });
        }

        const transfer = await Transfer.create({
            user: req.user._id,
            currentDepartment: req.user.department || 'Not Assigned',
            requestedDepartment,
            reason
        });

        logger.info('Transfer requested', { userId: req.user._id, transferId: transfer._id });

        res.status(201).json({
            success: true,
            message: 'Transfer request submitted successfully',
            data: { transfer }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my transfer requests
 * @route   GET /api/transfers/my
 * @access  Protected
 */
const getMyTransfers = async (req, res, next) => {
    try {
        const transfers = await Transfer.find({ user: req.user._id })
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transfers.length,
            data: { transfers }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all transfer requests (HR/Admin)
 * @route   GET /api/transfers
 * @access  HR, Admin
 */
const getAllTransfers = async (req, res, next) => {
    try {
        const { status, limit = 50 } = req.query;

        const query = {};
        if (status) query.status = status;

        const transfers = await Transfer.find(query)
            .populate('user', 'name email employeeId department')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: transfers.length,
            data: { transfers }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve/Reject transfer
 * @route   PATCH /api/transfers/:id/approve
 * @access  HR, Admin
 */
const approveTransfer = async (req, res, next) => {
    try {
        const { status, approverRemarks, effectiveDate } = req.body;

        const transfer = await Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: 'Transfer request not found'
            });
        }

        if (transfer.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This transfer request has already been processed'
            });
        }

        transfer.status = status;
        transfer.approvedBy = req.user._id;
        transfer.approverRemarks = approverRemarks;
        if (effectiveDate) transfer.effectiveDate = new Date(effectiveDate);
        await transfer.save();

        // If approved, update user's department
        if (status === 'approved') {
            await User.findByIdAndUpdate(transfer.user, {
                department: transfer.requestedDepartment
            });
            logger.info('User department updated after transfer approval', {
                userId: transfer.user,
                newDepartment: transfer.requestedDepartment
            });
        }

        logger.info('Transfer status updated', { transferId: transfer._id, status, approvedBy: req.user._id });

        res.status(200).json({
            success: true,
            message: `Transfer ${status} successfully`,
            data: { transfer }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestTransfer,
    getMyTransfers,
    getAllTransfers,
    approveTransfer
};
