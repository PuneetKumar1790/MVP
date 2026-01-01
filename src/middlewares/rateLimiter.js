const rateLimit = require('express-rate-limit');

// Rate limiter for login route (prevent brute force)
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 1 minute.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter
};
