// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;