const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log error (logger already sanitizes sensitive data)
    logger.error('Request error', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Zod validation error
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map(e => e.message)
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
