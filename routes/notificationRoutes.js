const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

// Notification CRUD routes (prefix /api/admin di app.js)
router.get('/notifications', notificationController.getAllNotifications);
router.post('/notifications', notificationController.createNotification);
router.get('/notifications/:id', notificationController.getNotificationById);
router.put('/notifications/:id', notificationController.updateNotification);
router.delete('/notifications/:id', notificationController.deleteNotification);
router.put('/notifications/:id/toggle-status', notificationController.toggleNotificationStatus);

module.exports = router;
