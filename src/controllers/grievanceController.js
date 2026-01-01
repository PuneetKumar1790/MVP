const Grievance = require('../models/Grievance');
const FileMeta = require('../models/FileMeta');
const { uploadToBlob } = require('../services/azureBlobService');
const logger = require('../utils/logger');

/**
 * @desc    Create grievance (with optional file)
 * @route   POST /api/grievances
 * @access  Protected
 */
const createGrievance = async (req, res, next) => {
    try {
        const { category, description, priority } = req.body;

        const grievanceData = {
            user: req.user._id,
            category,
            description,
            priority: priority || 'medium'
        };

        // Handle file upload if present
        console.log('📁 File received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

        if (req.file) {
            try {
                console.log('📤 Uploading to Azure Blob...');
                const { blobUrl, blobName } = await uploadToBlob(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype
                );
                console.log('✅ Upload successful:', blobUrl);

                grievanceData.fileUrl = blobUrl;
                grievanceData.fileMeta = {
                    fileName: blobName,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    blobName
                };

                // Also save to FileMeta collection
                await FileMeta.create({
                    fileName: blobName,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    blobUrl,
                    blobName,
                    uploadedBy: req.user._id,
                    relatedEntityType: 'grievance'
                });

                logger.info('File uploaded for grievance', { userId: req.user._id, blobName });
            } catch (uploadError) {
                console.error('❌ File upload failed:', uploadError.message);
                logger.error('File upload failed', uploadError);
                // Return error instead of silently continuing
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed: ' + uploadError.message
                });
            }
        }

        const grievance = await Grievance.create(grievanceData);

        // Update FileMeta with grievance ID
        if (grievance.fileMeta?.blobName) {
            await FileMeta.findOneAndUpdate(
                { blobName: grievance.fileMeta.blobName },
                { relatedEntityId: grievance._id }
            );
        }

        logger.info('Grievance created', { userId: req.user._id, grievanceId: grievance._id });

        res.status(201).json({
            success: true,
            message: 'Grievance submitted successfully',
            data: { grievance }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my grievances
 * @route   GET /api/grievances/my
 * @access  Protected
 */
const getMyGrievances = async (req, res, next) => {
    try {
        const { status, limit = 20 } = req.query;

        const query = { user: req.user._id };
        if (status) query.status = status;

        const grievances = await Grievance.find(query)
            .populate('respondedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: grievances.length,
            data: { grievances }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all grievances (HR/Admin)
 * @route   GET /api/grievances
 * @access  HR, Admin
 */
const getAllGrievances = async (req, res, next) => {
    try {
        const { status, category, priority, limit = 50 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const grievances = await Grievance.find(query)
            .populate('user', 'name email employeeId department')
            .populate('respondedBy', 'name email')
            .sort({ priority: -1, createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: grievances.length,
            data: { grievances }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Respond to grievance
 * @route   PATCH /api/grievances/:id/respond
 * @access  HR, Admin
 */
const respondToGrievance = async (req, res, next) => {
    try {
        const { status, response } = req.body;

        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        if (grievance.status === 'closed') {
            return res.status(400).json({
                success: false,
                message: 'This grievance is already closed'
            });
        }

        grievance.status = status;
        grievance.response = response;
        grievance.respondedBy = req.user._id;
        grievance.respondedAt = new Date();
        await grievance.save();

        logger.info('Grievance responded', { grievanceId: grievance._id, status, respondedBy: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Grievance response submitted',
            data: { grievance }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGrievance,
    getMyGrievances,
    getAllGrievances,
    respondToGrievance
};
