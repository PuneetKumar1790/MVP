const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { applyLeaveSchema, updateLeaveStatusSchema, idParamSchema } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /api/leave/apply
router.post(
    '/apply',
    validateRequest(applyLeaveSchema),
    applyLeave
);

// GET /api/leave/my
router.get('/my', getMyLeaves);

// GET /api/leave (HR/Dept Head/Admin)
router.get(
    '/',
    roleMiddleware('hr', 'department_head', 'admin'),
    getAllLeaves
);

// PATCH /api/leave/:id/status (HR/Dept Head)
router.patch(
    '/:id/status',
    roleMiddleware('hr', 'department_head', 'admin'),
    validateRequest(idParamSchema, 'params'),
    validateRequest(updateLeaveStatusSchema),
    updateLeaveStatus
);

module.exports = router;
