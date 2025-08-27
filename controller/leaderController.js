const db = require('../db/db');

// Ajukan sebagai ketua KKN
const applyAsLeader = (req, res) => {
  const { nim, village_name } = req.body;
  
  // Validasi input
  if (!nim || !village_name) {
    return res.status(400).json({
      success: false,
      message: 'NIM dan nama desa harus diisi'
    });
  }
  
  // Validasi format NIM
  if (!nim.match(/^[0-9]{6,15}$/)){
    return res.status(400).json({
      success: false,
      message: 'NIM harus terdiri dari 10-15 digit angka'
    });
  }
  
  // Cek apakah user ada di tabel users
  const checkUserQuery = 'SELECT * FROM users WHERE nim = ?';
  db.query(checkUserQuery, [nim], (err, userResults) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan. Silakan daftar terlebih dahulu.'
      });
    }
    
    // Cek apakah sudah terdaftar sebagai ketua
    const checkLeaderQuery = 'SELECT * FROM kkn_group_leaders WHERE nim = ?';
    db.query(checkLeaderQuery, [nim], (err, leaderResults) => {
      if (err) {
        console.error('Error checking leader application:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server'
        });
      }
      
      if (leaderResults.length > 0) {
        const status = leaderResults[0].status;
        let message = 'Anda sudah mengajukan sebagai ketua KKN';
        
        if (status === 'approved') {
          message = 'Anda sudah disetujui sebagai ketua KKN';
        } else if (status === 'rejected') {
          message = 'Pengajuan Anda sebagai ketua KKN ditolak';
        }
        
        return res.status(400).json({
          success: false,
          message: message,
          data: leaderResults[0]
        });
      }
      
      // Insert aplikasi ketua baru
      const insertQuery = 'INSERT INTO kkn_group_leaders (nim, village_name, status) VALUES (?, ?, "pending")';
      db.query(insertQuery, [nim, village_name], (err, result) => {
        if (err) {
          console.error('Error applying as leader:', err);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
          });
        }
        
        res.json({
          success: true,
          message: 'Pengajuan sebagai ketua KKN berhasil dikirim. Menunggu persetujuan admin.',
          data: {
            id: result.insertId,
            nim,
            village_name,
            status: 'pending',
            created_at: new Date()
          }
        });
      });
    });
  });
};

// Cek status pengajuan ketua
const checkLeaderStatus = (req, res) => {
  const { nim } = req.params;
  
  // Validasi NIM
  if (!nim || !nim.match(/^[0-9]{6,15}$/)) {
    return res.status(400).json({
      success: false,
      message: 'NIM tidak valid'
    });
  }
  
  const query = `
    SELECT l.*, u.name as nama, u.email
    FROM kkn_group_leaders l 
    LEFT JOIN users u ON l.nim = u.nim 
    WHERE l.nim = ?
  `;
  
  db.query(query, [nim], (err, results) => {
    if (err) {
      console.error('Error checking leader status:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    if (results.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Tidak ada pengajuan sebagai ketua'
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
};

// Get semua pengajuan ketua (untuk admin)
const getAllLeaderApplications = (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT l.*, u.name as student_name, u.email, u.major
    FROM kkn_group_leaders l 
    LEFT JOIN users u ON l.nim = u.nim 
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM kkn_group_leaders l';
  let queryParams = [];
  let countParams = [];
  
  if (status && status !== 'all') {
    query += ' WHERE l.status = ?';
    countQuery += ' WHERE l.status = ?';
    queryParams.push(status);
    countParams.push(status);
  }
  
  query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));
  
  // Get total count
  db.query(countQuery, countParams, (err, countResults) => {
    if (err) {
      console.error('Error counting leader applications:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    const total = countResults[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get data
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error getting leader applications:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server'
        });
      }
      
      res.json({
        success: true,
        data: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    });
  });
};

// Update status pengajuan ketua (untuk admin)
const updateLeaderStatus = (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;
  
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status tidak valid'
    });
  }
  
  const query = 'UPDATE kkn_group_leaders SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?';
  
  db.query(query, [status, rejection_reason || null, id], (err, result) => {
    if (err) {
      console.error('Error updating leader status:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan ketua tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: `Status pengajuan berhasil diupdate menjadi ${status}`,
      data: {
        id: parseInt(id),
        status: status,
        rejection_reason: rejection_reason
      }
    });
  });
};

// Hapus pengajuan ketua
const deleteLeaderApplication = (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM kkn_group_leaders WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting leader application:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan ketua tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Pengajuan ketua berhasil dihapus'
    });
  });
};

module.exports = {
  applyAsLeader,
  checkLeaderStatus,
  getAllLeaderApplications,
  updateLeaderStatus,
  deleteLeaderApplication
};