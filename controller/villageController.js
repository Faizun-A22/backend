const db = require('../db/db');

const villageController = {
    getAllVillages: (req, res) => {
        db.query('SELECT * FROM kkn_village_quota', (error, results) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({ 
                    success: false,
                    message: 'Gagal mengambil data desa' 
                });
            }
            
            res.json({
                success: true,
                data: results,
                message: 'Berhasil mendapatkan data desa'
            });
        });
    },

    createVillage: (req, res) => {
        const { village_name, kecamatan, max_quota, wa_group_link, dosen_pendamping } = req.body;
        
        if (!village_name || !kecamatan || !max_quota) {
            return res.status(400).json({ message: 'Nama desa, kecamatan, dan kuota wajib diisi' });
        }

        // Cek apakah desa sudah ada
        db.query(
            'SELECT * FROM kkn_village_quota WHERE village_name = ?', 
            [village_name],
            (error, existing) => {
                if (error) {
                    console.error('Error checking village:', error);
                    return res.status(500).json({ message: 'Gagal memeriksa desa' });
                }
                
                if (existing.length > 0) {
                    return res.status(400).json({ message: 'Desa sudah ada' });
                }

                // Tambahkan desa baru
                db.query(
                    `INSERT INTO kkn_village_quota 
                        (village_name, kecamatan, max_quota, current_quota, wa_group_link, dosen_pendamping) 
                     VALUES (?, ?, ?, 0, ?, ?)`,
                    [village_name, kecamatan, max_quota, wa_group_link || null, dosen_pendamping || null],
                    (error) => {
                        if (error) {
                            console.error('Error creating village:', error);
                            return res.status(500).json({ message: 'Gagal menambahkan desa' });
                        }
                        
                        res.status(201).json({ message: 'Desa berhasil ditambahkan' });
                    }
                );
            }
        );
    },

    updateVillage: (req, res) => {
        const { villageName } = req.params;
        const { kecamatan, max_quota, wa_group_link, dosen_pendamping } = req.body;
        
        if (!kecamatan || !max_quota) {
            return res.status(400).json({ message: 'Kecamatan dan kuota wajib diisi' });
        }

        db.query(
            `UPDATE kkn_village_quota 
             SET kecamatan = ?, max_quota = ?, wa_group_link = ?, dosen_pendamping = ? 
             WHERE village_name = ?`,
            [kecamatan, max_quota, wa_group_link || null, dosen_pendamping || null, villageName],
            (error, result) => {
                if (error) {
                    console.error('Error updating village:', error);
                    return res.status(500).json({ message: 'Gagal memperbarui desa' });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Desa tidak ditemukan' });
                }
                
                res.json({ message: 'Desa berhasil diperbarui' });
            }
        );
    },

    deleteVillage: (req, res) => {
        const { villageName } = req.params;
        
        db.query(
            'SELECT current_quota FROM kkn_village_quota WHERE village_name = ?',
            [villageName],
            (error, village) => {
                if (error) {
                    console.error('Error checking village quota:', error);
                    return res.status(500).json({ message: 'Gagal memeriksa desa' });
                }
                
                if (village.length === 0) {
                    return res.status(404).json({ message: 'Desa tidak ditemukan' });
                }
                
                if (village[0].current_quota > 0) {
                    return res.status(400).json({ 
                        message: 'Tidak bisa menghapus desa yang sudah memiliki peserta' 
                    });
                }
                
                db.query(
                    'DELETE FROM kkn_village_quota WHERE village_name = ?',
                    [villageName],
                    (error) => {
                        if (error) {
                            console.error('Error deleting village:', error);
                            return res.status(500).json({ message: 'Gagal menghapus desa' });
                        }
                        
                        res.json({ message: 'Desa berhasil dihapus' });
                    }
                );
            }
        );
    }
};

module.exports = villageController;
