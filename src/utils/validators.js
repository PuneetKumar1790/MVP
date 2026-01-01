const { z } = require('zod');
const mongoose = require('mongoose');

// Custom ObjectId validator
const objectId = z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid ObjectId' }
);

// Auth schemas
const registerSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters')
});

const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

// Task schemas
const createTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
    description: z.string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional()
        .default('')
});

const updateTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
    description: z.string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional()
}).refine(
    (data) => data.title !== undefined || data.description !== undefined,
    { message: 'At least one field (title or description) is required' }
);

// Params schema
const idParamSchema = z.object({
    id: objectId
});

module.exports = {
    objectId,
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    createTaskSchema,
    updateTaskSchema,
    idParamSchema
};
