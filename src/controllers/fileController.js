const FileMeta = require('../models/FileMeta');
const { generateSasUrl, blobExists } = require('../services/azureBlobService');
const logger = require('../utils/logger');

/**
 * @desc    Get file access (SAS URL)
 * @route   GET /api/files/:blobName
 * @access  Protected
 */
const getFileAccess = async (req, res, next) => {
    try {
        const { blobName } = req.params;

        // Find file metadata
        const fileMeta = await FileMeta.findOne({ blobName }).populate('uploadedBy', 'name email');

        if (!fileMeta) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check permissions
        // Users can access their own files, HR/Admin can access all
        const isOwner = fileMeta.uploadedBy._id.toString() === req.user._id.toString();
        const isHrOrAdmin = ['hr', 'admin'].includes(req.user.role);

        if (!isOwner && !isHrOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this file'
            });
        }

        // Check if blob exists
        const exists = await blobExists(blobName);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'File not found in storage'
            });
        }

        // Generate SAS URL (valid for 10 minutes)
        const sasUrl = generateSasUrl(blobName, 10);

        logger.info('File access granted', { blobName, userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'File access URL generated',
            data: {
                url: sasUrl,
                expiresIn: '10 minutes',
                fileMeta: {
                    fileName: fileMeta.originalName,
                    mimeType: fileMeta.mimeType,
                    size: fileMeta.size,
                    uploadedAt: fileMeta.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my uploaded files
 * @route   GET /api/files/my
 * @access  Protected
 */
const getMyFiles = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;

        const files = await FileMeta.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: files.length,
            data: { files }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFileAccess,
    getMyFiles
};
