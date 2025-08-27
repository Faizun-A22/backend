const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Get all users
router.get('/users', userController.getAllUsers);

// Get single user
router.get('/users/:id', userController.getUserById);

// Create new user
router.post('/users', userController.createUser);

// Update user
router.put('/users/:id', userController.updateUser);

// Delete user
router.delete('/users/:id', userController.deleteUser);

module.exports = router;