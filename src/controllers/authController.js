const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../services/authService');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({ name, email, password });

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Save refresh token to user
        user.refreshToken = tokens.refreshToken;
        await user.save();

        logger.info('User registered', { userId: user._id, email: user.email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toSafeObject(),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        logger.info('User logged in', { userId: user._id });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toSafeObject(),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find user with stored refresh token
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Update stored refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        logger.info('Token refreshed', { userId: user._id });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token
        req.user.refreshToken = null;
        await req.user.save();

        logger.info('User logged out', { userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout
};
