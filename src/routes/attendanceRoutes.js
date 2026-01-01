const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { markAttendanceSchema } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /api/attendance/mark
router.post(
    '/mark',
    validateRequest(markAttendanceSchema),
    markAttendance
);

// GET /api/attendance/my
router.get('/my', getMyAttendance);

// GET /api/attendance (HR/Admin only)
router.get(
    '/',
    roleMiddleware('hr', 'admin'),
    getAllAttendance
);

module.exports = router;
