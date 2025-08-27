const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Handle preflight OPTIONS request
router.options('/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', ['http://localhost:5500', 'http://127.0.0.1:5500']);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;