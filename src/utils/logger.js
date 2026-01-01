/**
 * Safe logger that never logs sensitive data
 */

const SENSITIVE_FIELDS = ['password', 'token', 'refreshToken', 'accessToken', 'authorization', 'secret'];

const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(sanitized)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitize(sanitized[key]);
        }
    }

    return sanitized;
};

const logger = {
    info: (message, data = null) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? sanitize(data) : '');
    },

    error: (message, error = null) => {
        const errorData = error ? {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } : '';
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorData);
    },

    warn: (message, data = null) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? sanitize(data) : '');
    },

    debug: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? sanitize(data) : '');
        }
    }
};

module.exports = logger;
