const express = require('express');
const router = express.Router();
const { createGrievance, getMyGrievances, getAllGrievances, respondToGrievance } = require('../controllers/grievanceController');
const { createGrievanceSchema, respondGrievanceSchema, idParamSchema } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { uploadOptional } = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /api/grievances (with optional file upload)
router.post(
    '/',
    uploadOptional('file'),
    validateRequest(createGrievanceSchema),
    createGrievance
);

// GET /api/grievances/my
router.get('/my', getMyGrievances);

// GET /api/grievances (HR/Admin)
router.get(
    '/',
    roleMiddleware('hr', 'admin'),
    getAllGrievances
);

// PATCH /api/grievances/:id/respond (HR/Admin)
router.patch(
    '/:id/respond',
    roleMiddleware('hr', 'admin'),
    validateRequest(idParamSchema, 'params'),
    validateRequest(respondGrievanceSchema),
    respondToGrievance
);

module.exports = router;
