const db = require('../db/db');

// Mendapatkan semua registrasi KKN dengan pagination
exports.getAllKknRegistrations = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || ''; // Filter berdasarkan status
    const search = req.query.search || ''; // Filter berdasarkan pencarian

    // Build WHERE clause untuk filter
    let whereClause = '';
    let queryParams = [];
    
    if (status) {
        whereClause += ' WHERE status = ?';
        queryParams.push(status);
    }
    
    if (search) {
        whereClause += (whereClause ? ' AND' : ' WHERE');
        whereClause += ' (nim LIKE ? OR full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Query untuk mengambil data registrasi KKN
    const kknQuery = `
        SELECT nim, full_name, phone, email, study_program, village, domicile, 
               jacket_size, status, created_at, updated_at
        FROM kkn_registrations 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `;

    // Query untuk total data
    const countQuery = `SELECT COUNT(*) as total FROM kkn_registrations ${whereClause}`;

    // Parameter untuk query data
    const dataParams = [...queryParams, limit, offset];
    
    // Execute query untuk mengambil data
    db.query(kknQuery, dataParams, (err, results) => {
        if (err) {
            console.error('Error fetching KKN data:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil data KKN',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        // Execute query untuk menghitung total data
        db.query(countQuery, queryParams, (err, countResult) => {
            if (err) {
                console.error('Error counting KKN data:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal menghitung total data KKN',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                message: 'Data KKN berhasil diambil',
                data: results,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        });
    });
};

// Mendapatkan detail registrasi KKN berdasarkan NIM
exports.getKknRegistrationByNim = (req, res) => {
    const { nim } = req.params;

    const query = `
        SELECT nim, full_name, phone, email, study_program, village, domicile, 
               jacket_size, krs_file, payment_file, khs_file, status, 
               created_at, updated_at
        FROM kkn_registrations 
        WHERE nim = ?
    `;

    db.query(query, [nim], (err, results) => {
        if (err) {
            console.error('Error fetching KKN registration by NIM:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil data registrasi KKN',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data registrasi KKN tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            message: 'Data registrasi KKN berhasil diambil',
            data: results[0]
        });
    });
};

// Memperbarui status registrasi KKN
exports.updateKknStatus = (req, res) => {
    const { nim } = req.params;
    const { status, reason } = req.body;

    // Validasi status
    const validStatuses = ['pending', 'verified', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: 'Status tidak valid. Status yang diizinkan: ' + validStatuses.join(', ')
        });
    }

    // Cek apakah data exists
    const checkQuery = 'SELECT nim FROM kkn_registrations WHERE nim = ?';
    
    db.query(checkQuery, [nim], (err, checkResult) => {
        if (err) {
            console.error('Error checking KKN registration:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal memeriksa data registrasi KKN' 
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data registrasi KKN tidak ditemukan' 
            });
        }

        // Update status
        const updateQuery = `
            UPDATE kkn_registrations 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE nim = ?
        `;

        db.query(updateQuery, [status, nim], (err, result) => {
            if (err) {
                console.error('Error updating KKN status:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal memperbarui status KKN',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            res.json({ 
                success: true, 
                message: `Status KKN berhasil diperbarui menjadi ${status}`,
                data: {
                    nim: nim,
                    status: status,
                    reason: reason || null
                }
            });
        });
    });
};

// Mendapatkan kuota desa
exports.getVillageQuotas = (req, res) => {
    const query = 'SELECT * FROM kkn_village_quota ORDER BY village_name';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching village quotas:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil data kuota desa',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        res.json({ 
            success: true, 
            message: 'Data kuota desa berhasil diambil',
            data: results 
        });
    });
};

// Mendapatkan statistik registrasi KKN
exports.getKknStatistics = (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_registrations,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_count,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
        FROM kkn_registrations
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching KKN statistics:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil statistik KKN',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        res.json({
            success: true,
            message: 'Statistik KKN berhasil diambil',
            data: results[0]
        });
    });
};