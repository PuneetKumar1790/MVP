const multer = require('multer');

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Configure multer storage (memory storage for Azure upload)
const storage = multer.memoryStorage();

// File filter to validate MIME types
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: PDF, JPEG, PNG`), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only allow single file upload
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName = 'file') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: 'Only single file upload is allowed'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

// Middleware for optional file upload (doesn't error if no file)
const uploadOptional = (fieldName = 'file') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

module.exports = {
    uploadSingle,
    uploadOptional,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE
};
