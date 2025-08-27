const express = require('express');
const router = express.Router();
const leaderController = require('../controller/leaderController');

// @route   POST /api/leader/apply-leader
// @desc    Ajukan sebagai ketua KKN
// @access  Public
router.post('/apply-leader', leaderController.applyAsLeader);

// @route   GET /api/leader/status/:nim
// @desc    Cek status pengajuan ketua
// @access  Public
router.get('/status/:nim', leaderController.checkLeaderStatus);

// @route   GET /api/leader/applications
// @desc    Get semua pengajuan ketua (admin)
// @access  Admin
router.get('/applications', leaderController.getAllLeaderApplications);

// @route   PUT /api/leader/status/:id
// @desc    Update status pengajuan ketua (admin)
// @access  Admin
router.put('/status/:id', leaderController.updateLeaderStatus);

// @route   DELETE /api/leader/:id
// @desc    Hapus pengajuan ketua (admin)
// @access  Admin
router.delete('/:id', leaderController.deleteLeaderApplication);

module.exports = router;