const fs = require('fs');
const path = require('path');
const db = require('../db/db');


const uploadDir = path.join(__dirname, '../uploads/kkn');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.registerKKN = (req, res) => {
    console.log('Request Body:', req.body);
    const { 
        nim, 
        phone, 
        village_id,
        domicile, 
        jacket_size,
        krs_file,    
        payment_file,
        khs_file,
        study_program // Ini sudah ada di req.body
    } = req.body;

    if (!nim || !phone || !village_id || !domicile || !jacket_size || !study_program) {
        cleanupFiles(krs_path, payment_path, khs_path);
        return res.status(400).json({ message: 'Data wajib tidak lengkap' });
    }

    // Dapatkan data user dari database untuk kolom wajib lainnya
    db.query('SELECT name, email FROM users WHERE nim = ?', [nim], (err, userResults) => {
        if (err || userResults.length === 0) {
            return res.status(400).json({ message: 'Data user tidak ditemukan' });
        }

        const user = userResults[0];
        const village_name = village_id;

        db.query(
            'INSERT INTO kkn_registrations SET ?',
            { 
                nim,
                full_name: user.name,
                phone,
                email: user.email, 
                study_program: study_program, // Gunakan dari request body, bukan dari user
                village: village_name,
                domicile,
                jacket_size,
                krs_file,
                payment_file,
                khs_file,
                status: 'pending'
            },
            (err, result) => {
                if (err) {
                    console.error('Database Error:', err);
                    return res.status(500).json({ 
                        message: 'Gagal menyimpan data ke database',
                        error: err.message 
                    });
                }

                // Update quota
                db.query(
                    'UPDATE kkn_village_quota SET current_quota = current_quota + 1 WHERE village_name = ?',
                    [village_name],
                    (err) => {
                        if (err) console.error('Gagal update quota:', err);
                    }
                );

                res.json({ 
                    success: true,
                    message: 'Pendaftaran KKN berhasil!'
                });
            }
        );
    });
};


function cleanupFiles(...files) {
    files.forEach(filePath => {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Gagal menghapus file:', filePath, err);
            }
        }
    });
}

exports.getKKNData = (req, res) => {
      console.log("🔥 getKKNData terpanggil, nim =", req.params.nim);
    const nim = req.params.nim;
    
    db.query(
        'SELECT * FROM kkn_registrations WHERE nim = ?',
        [nim],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            if (results.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
            res.json(results[0]);
        }
    );
};

exports.getAllKKNData = (req, res) => {
    db.query(
        'SELECT * FROM kkn_registrations',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            res.json(results);
        }
    );
};

exports.updateKKNStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.query(
        'UPDATE kkn_registrations SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
            res.json({ message: 'Status berhasil diupdate' });
        }
    );
};

exports.getVillageQuotas = (req, res) => {
    console.log(" getVillageQuotas terpanggil");
    db.query(
        'SELECT * FROM kkn_village_quota',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Server error',
                    error: err.message // Tambahkan pesan error spesifik
                });
            }
            
            res.json({
                success: true,
                message: 'Data kuota desa berhasil diambil',
                data: results // Pastikan data dikemas dalam property 'data'
            });
        }
    );
};