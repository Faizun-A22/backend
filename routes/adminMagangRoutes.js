const express = require('express');
const router = express.Router();
const adminMagangController = require('../controller/adminMagangController');

// Middleware untuk memeriksa apakah user adalah admin
const isAdmin = (req, res, next) => {
    // Implementasi pemeriksaan role admin
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
    
    // Skip untuk development - implementasikan JWT verification disini
    req.user = { role: 'admin' }; // Mock user admin
    next();
};

router.get('/magang-registrations', isAdmin, adminMagangController.getAllMagangRegistrations);
router.put('/magang-registrations/:nim/status', isAdmin, adminMagangController.updateMagangStatus);
router.get('/magang-registrations/:nim', isAdmin, adminMagangController.getMagangRegistrationByNim);
router.delete('/magang-registrations/:nim', isAdmin, adminMagangController.deleteMagangRegistration);

module.exports = router;