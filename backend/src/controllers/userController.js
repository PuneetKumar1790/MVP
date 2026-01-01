/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user.toSafeObject()
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMe
};
