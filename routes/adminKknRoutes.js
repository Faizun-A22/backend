const express = require('express');
const router = express.Router();
const adminKknController = require('../controller/adminKknController');

// Middleware untuk memeriksa apakah user adalah admin
const isAdmin = (req, res, next) => {
    // Implementasi pemeriksaan role admin
    // Untuk saat ini, kita skip autentikasi (ganti dengan JWT verification yang sesungguhnya)
    
    // Contoh sederhana - ganti dengan implementasi JWT yang benar
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
    
    // Skip untuk development - implementasikan JWT verification disini
    req.user = { role: 'admin' }; // Mock user admin
    next();
};

// Routes untuk admin KKN
router.get('/kkn-registrations', isAdmin, adminKknController.getAllKknRegistrations);
router.put('/kkn-registrations/:nim/status', isAdmin, adminKknController.updateKknStatus);
router.get('/village-quotas', isAdmin, adminKknController.getVillageQuotas);
router.get('/kkn-registrations/:nim', isAdmin, adminKknController.getKknRegistrationByNim);

module.exports = router;