const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/authController');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

// POST /api/auth/register
router.post(
    '/register',
    validateRequest(registerSchema),
    register
);

// POST /api/auth/login (rate limited)
router.post(
    '/login',
    loginLimiter,
    validateRequest(loginSchema),
    login
);

// POST /api/auth/refresh
router.post(
    '/refresh',
    validateRequest(refreshTokenSchema),
    refresh
);

// POST /api/auth/logout (protected)
router.post(
    '/logout',
    authMiddleware,
    logout
);

module.exports = router;
