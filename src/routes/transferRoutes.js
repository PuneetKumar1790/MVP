const express = require('express');
const router = express.Router();
const { requestTransfer, getMyTransfers, getAllTransfers, approveTransfer } = require('../controllers/transferController');
const { requestTransferSchema, approveTransferSchema, idParamSchema } = require('../utils/validators');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /api/transfers/request
router.post(
    '/request',
    validateRequest(requestTransferSchema),
    requestTransfer
);

// GET /api/transfers/my
router.get('/my', getMyTransfers);

// GET /api/transfers (HR/Admin)
router.get(
    '/',
    roleMiddleware('hr', 'admin'),
    getAllTransfers
);

// PATCH /api/transfers/:id/approve (HR/Admin)
router.patch(
    '/:id/approve',
    roleMiddleware('hr', 'admin'),
    validateRequest(idParamSchema, 'params'),
    validateRequest(approveTransferSchema),
    approveTransfer
);

module.exports = router;
