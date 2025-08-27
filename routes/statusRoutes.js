const express = require('express');
const router = express.Router();
const statusController = require('../controller/statusController');

// Endpoint untuk mendapatkan status pendaftaran berdasarkan NIM
router.get('/status/:nim', statusController.getStatusByNim);

module.exports = router;