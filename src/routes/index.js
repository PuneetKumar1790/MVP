const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const transferRoutes = require('./transferRoutes');
const grievanceRoutes = require('./grievanceRoutes');
const fileRoutes = require('./fileRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/transfers', transferRoutes);
router.use('/grievances', grievanceRoutes);
router.use('/files', fileRoutes);

module.exports = router;
