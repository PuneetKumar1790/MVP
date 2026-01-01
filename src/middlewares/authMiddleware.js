const { verifyAccessToken } = require('../services/authService');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token is invalid or expired.'
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

module.exports = authMiddleware;
