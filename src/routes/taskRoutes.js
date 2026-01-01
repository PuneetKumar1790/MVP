const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createTaskSchema, updateTaskSchema, idParamSchema } = require('../utils/validators');

// All routes are protected
router.use(authMiddleware);

// POST /api/tasks
router.post(
    '/',
    validateRequest(createTaskSchema),
    createTask
);

// GET /api/tasks
router.get('/', getTasks);

// GET /api/tasks/:id
router.get(
    '/:id',
    validateRequest(idParamSchema, 'params'),
    getTask
);

// PUT /api/tasks/:id
router.put(
    '/:id',
    validateRequest(idParamSchema, 'params'),
    validateRequest(updateTaskSchema),
    updateTask
);

// DELETE /api/tasks/:id
router.delete(
    '/:id',
    validateRequest(idParamSchema, 'params'),
    deleteTask
);

module.exports = router;
