const express = require('express');
const router = express.Router();
const groupLeaderController = require('../controller/kknGroupLeaderController');

// Get all group leaders with optional filtering
router.get('/', groupLeaderController.getAllGroupLeaders);

// Get single group leader
router.get('/:id', groupLeaderController.getGroupLeaderById);

// Update group leader status
router.put('/:id/status', groupLeaderController.updateGroupLeaderStatus);

// Delete group leader
router.delete('/:id', groupLeaderController.deleteGroupLeader);

module.exports = router;