const { z } = require('zod');
const mongoose = require('mongoose');

// Custom ObjectId validator
const objectId = z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid ObjectId' }
);

// Date string validator (ISO format)
const dateString = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
);

// ==================== AUTH SCHEMAS ====================

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
        .max(128, 'Password cannot exceed 128 characters'),
    role: z.enum(['employee', 'hr', 'department_head', 'admin']).default('employee'),
    employeeId: z.string().trim().optional(),
    department: z.string().max(100).trim().optional(),
    designation: z.string().max(100).trim().optional(),
    dateOfJoining: dateString.optional()
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

// ==================== ATTENDANCE SCHEMAS ====================

const markAttendanceSchema = z.object({
    status: z.enum(['Present', 'Absent', 'Late', 'WFH'], {
        errorMap: () => ({ message: 'Status must be Present, Absent, Late, or WFH' })
    }),
    date: dateString.optional(),
    remarks: z.string().max(500).optional()
});

// ==================== LEAVE SCHEMAS ====================

const applyLeaveSchema = z.object({
    leaveType: z.enum(['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid'], {
        errorMap: () => ({ message: 'Invalid leave type' })
    }),
    fromDate: dateString,
    toDate: dateString,
    reason: z.string()
        .min(5, 'Reason must be at least 5 characters')
        .max(1000, 'Reason cannot exceed 1000 characters')
}).refine(
    (data) => new Date(data.fromDate) <= new Date(data.toDate),
    { message: 'From date must be before or equal to To date', path: ['toDate'] }
);

const updateLeaveStatusSchema = z.object({
    status: z.enum(['approved', 'rejected'], {
        errorMap: () => ({ message: 'Status must be approved or rejected' })
    }),
    approverRemarks: z.string().max(500).optional()
});

// ==================== TRANSFER SCHEMAS ====================

const requestTransferSchema = z.object({
    requestedDepartment: z.string()
        .min(1, 'Requested department is required')
        .max(100, 'Department name cannot exceed 100 characters')
        .trim(),
    reason: z.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(2000, 'Reason cannot exceed 2000 characters')
});

const approveTransferSchema = z.object({
    status: z.enum(['approved', 'rejected'], {
        errorMap: () => ({ message: 'Status must be approved or rejected' })
    }),
    approverRemarks: z.string().max(500).optional(),
    effectiveDate: dateString.optional()
});

// ==================== GRIEVANCE SCHEMAS ====================

const createGrievanceSchema = z.object({
    category: z.enum(['harassment', 'discrimination', 'workplace_safety', 'salary', 'benefits', 'management', 'other'], {
        errorMap: () => ({ message: 'Invalid grievance category' })
    }),
    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description cannot exceed 5000 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

const respondGrievanceSchema = z.object({
    status: z.enum(['in_progress', 'resolved', 'closed'], {
        errorMap: () => ({ message: 'Status must be in_progress, resolved, or closed' })
    }),
    response: z.string()
        .min(10, 'Response must be at least 10 characters')
        .max(2000, 'Response cannot exceed 2000 characters')
});

// ==================== PARAMS SCHEMAS ====================

const idParamSchema = z.object({
    id: objectId
});

// ==================== TASK SCHEMAS (kept for backward compatibility) ====================

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

module.exports = {
    objectId,
    dateString,
    // Auth
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    // Attendance
    markAttendanceSchema,
    // Leave
    applyLeaveSchema,
    updateLeaveStatusSchema,
    // Transfer
    requestTransferSchema,
    approveTransferSchema,
    // Grievance
    createGrievanceSchema,
    respondGrievanceSchema,
    // Params
    idParamSchema,
    // Tasks (backward compatibility)
    createTaskSchema,
    updateTaskSchema
};
