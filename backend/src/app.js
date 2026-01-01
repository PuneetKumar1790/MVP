const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize request data against NoSQL injection
app.use(mongoSanitize());

// Request logging (excluding sensitive data)
morgan.token('body', (req) => {
    const body = { ...req.body };
    // Never log sensitive fields
    if (body.password) body.password = '[REDACTED]';
    if (body.refreshToken) body.refreshToken = '[REDACTED]';
    if (body.accessToken) body.accessToken = '[REDACTED]';
    return JSON.stringify(body);
});

app.use(morgan(':method :url :status :response-time ms - :body'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
