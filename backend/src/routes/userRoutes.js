const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/users/me (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
