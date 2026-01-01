const Task = require('../models/Task');
const logger = require('../utils/logger');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Protected
 */
const createTask = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        const task = await Task.create({
            title,
            description,
            owner: req.user._id
        });

        logger.info('Task created', { taskId: task._id, userId: req.user._id });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get tasks (user sees own, admin sees all)
 * @route   GET /api/tasks
 * @access  Protected
 */
const getTasks = async (req, res, next) => {
    try {
        let query = {};

        // Non-admin users can only see their own tasks
        if (req.user.role !== 'admin') {
            query.owner = req.user._id;
        }

        const tasks = await Task.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Protected
 */
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate('owner', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Non-admin can only view their own tasks
        if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this task'
            });
        }

        res.status(200).json({
            success: true,
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Protected (owner only)
 */
const updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Only owner can update (even admins cannot update others' tasks)
        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        const { title, description } = req.body;

        if (title) task.title = title;
        if (description !== undefined) task.description = description;

        await task.save();

        logger.info('Task updated', { taskId: task._id, userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Protected (owner or admin)
 */
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Owner or admin can delete
        if (task.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this task'
            });
        }

        await task.deleteOne();

        logger.info('Task deleted', { taskId: req.params.id, userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
};
