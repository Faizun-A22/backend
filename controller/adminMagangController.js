const db = require('../db/db');

// Mendapatkan semua registrasi Magang dengan pagination
exports.getAllMagangRegistrations = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

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

    const magangQuery = `
        SELECT nim, full_name, phone, email, study_program, company, 
               internship_field, duration, status, created_at, updated_at
        FROM magang_registrations 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM magang_registrations ${whereClause}`;

    const dataParams = [...queryParams, limit, offset];
    
    db.query(magangQuery, dataParams, (err, results) => {
        if (err) {
            console.error('Error fetching Magang data:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil data Magang',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        db.query(countQuery, queryParams, (err, countResult) => {
            if (err) {
                console.error('Error counting Magang data:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal menghitung total data Magang',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                message: 'Data Magang berhasil diambil',
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

// Mendapatkan detail registrasi Magang berdasarkan NIM
exports.getMagangRegistrationByNim = (req, res) => {
    const { nim } = req.params;

    const query = `
        SELECT nim, full_name, phone, email, study_program, company, 
               internship_field, duration, work_certificate_file, 
               krs_file, payment_file, khs_file, status, 
               created_at, updated_at
        FROM magang_registrations 
        WHERE nim = ?
    `;

    db.query(query, [nim], (err, results) => {
        if (err) {
            console.error('Error fetching Magang registration by NIM:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal mengambil data registrasi Magang',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data registrasi Magang tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            message: 'Data registrasi Magang berhasil diambil',
            data: results[0]
        });
    });
};

// Memperbarui status registrasi Magang
exports.updateMagangStatus = (req, res) => {
    const { nim } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'verified', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: 'Status tidak valid. Status yang diizinkan: ' + validStatuses.join(', ')
        });
    }

    const checkQuery = 'SELECT nim FROM magang_registrations WHERE nim = ?';
    
    db.query(checkQuery, [nim], (err, checkResult) => {
        if (err) {
            console.error('Error checking Magang registration:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal memeriksa data registrasi Magang' 
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data registrasi Magang tidak ditemukan' 
            });
        }

        const updateQuery = `
            UPDATE magang_registrations 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE nim = ?
        `;

        db.query(updateQuery, [status, nim], (err, result) => {
            if (err) {
                console.error('Error updating Magang status:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal memperbarui status Magang',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            res.json({ 
                success: true, 
                message: `Status Magang berhasil diperbarui menjadi ${status}`,
                data: {
                    nim: nim,
                    status: status
                }
            });
        });
    });
};

// Menghapus registrasi Magang
exports.deleteMagangRegistration = (req, res) => {
    const { nim } = req.params;

    const checkQuery = 'SELECT nim FROM magang_registrations WHERE nim = ?';
    
    db.query(checkQuery, [nim], (err, checkResult) => {
        if (err) {
            console.error('Error checking Magang registration:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Gagal memeriksa data registrasi Magang' 
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data registrasi Magang tidak ditemukan' 
            });
        }

        const deleteQuery = 'DELETE FROM magang_registrations WHERE nim = ?';

        db.query(deleteQuery, [nim], (err, result) => {
            if (err) {
                console.error('Error deleting Magang registration:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal menghapus data registrasi Magang',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            res.json({ 
                success: true, 
                message: 'Data registrasi Magang berhasil dihapus'
            });
        });
    });
};