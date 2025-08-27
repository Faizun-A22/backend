const express = require('express');
const router = express.Router();
const adminNotificationController = require('../controller/adminNotificationController');

// Admin Notification Routes
router.get('/', adminNotificationController.getAllNotifications);
router.post('/', adminNotificationController.createNotification);
router.put('/:id', adminNotificationController.updateNotification);
router.delete('/:id', adminNotificationController.deleteNotification);
router.patch('/:id/toggle-status', adminNotificationController.toggleNotificationStatus);

module.exports = router;
