const express = require('express');
const router = express.Router();
const { getFileAccess, getMyFiles } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/files/my
router.get('/my', getMyFiles);

// GET /api/files/:blobName
router.get('/:blobName', getFileAccess);

module.exports = router;
