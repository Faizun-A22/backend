const db = require('../db/db');

exports.getStatusByNim = (req, res) => {
    const { nim } = req.params;

    // Cek di tabel KKN dulu
    db.query('SELECT * FROM kkn_registrations WHERE nim = ?', [nim], (err, kknResults) => {
        if (err) {
            console.error('Error query KKN:', err); // Tambahkan logging
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data KKN',
                error: err.message // Tambahkan detail error
            });
        }

        // Jika ditemukan di KKN
        if (kknResults.length > 0) {
            const kknData = kknResults[0];
            return res.json({
                success: true,
                data: {
                    nama: kknData.full_name,
                    nim: kknData.nim,
                    program: 'KKN',
                    lokasi: kknData.village || 'Belum ditentukan', // Default jika village null
                    tanggalPendaftaran: kknData.created_at,
                    status: kknData.status
                }
            });
        }

        // Jika tidak ditemukan di KKN, cek di Magang
        db.query('SELECT * FROM magang_registrations WHERE nim = ?', [nim], (err, magangResults) => {
            if (err) {
                console.error('Error query Magang:', err); // Tambahkan logging
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gagal mengambil data Magang',
                    error: err.message // Tambahkan detail error
                });
            }

            // Jika ditemukan di Magang
            if (magangResults.length > 0) {
                const magangData = magangResults[0];
                return res.json({
                    success: true,
                    data: {
                        nama: magangData.full_name,
                        nim: magangData.nim,
                        program: 'Magang',
                        lokasi: magangData.company || 'Belum ditentukan', // Gunakan company sebagai lokasi
                        tanggalPendaftaran: magangData.created_at,
                        status: magangData.status
                    }
                });
            }

            // Jika tidak ditemukan di kedua tabel
            return res.json({
                success: true,
                data: null,
                message: 'Mahasiswa belum terdaftar di program KKN atau Magang'
            });
        });
    });
};