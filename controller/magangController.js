const db = require('../db/db');

const VALID_STUDY_PROGRAMS = [
  'manajemen', 
  'akuntansi', 
  'hukum_bisnis', 
  'sistem_teknologi_informasi', 
  'sistem_informasi'
];

const VALID_STATUSES = [
  'pending',
  'verified',
  'approved',
  'rejected'
];

exports.registerMagang = (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    const { 
      nim, 
      fullName: full_name, 
      phone, 
      email, 
      studyProgram: study_program, 
      company, 
      internshipField: internship_field, 
      duration,
      work_certificate_file,
      krs_file,
      payment_file,
      khs_file
    } = req.body;

    if (!nim || !full_name || !company) {
      return res.status(400).json({
        success: false,
        message: 'NIM, nama lengkap, dan perusahaan wajib diisi'
      });
    }

    if (study_program && !VALID_STUDY_PROGRAMS.includes(study_program)) {
      return res.status(400).json({
        success: false,
        message: 'Program studi tidak valid',
        valid_programs: VALID_STUDY_PROGRAMS
      });
    }

    const magangData = {
      nim,
      full_name,
      phone,
      email,
      study_program,
      company,
      internship_field,
      duration: duration || null,
      work_certificate_file: work_certificate_file || null,
      krs_file: krs_file || null,
      payment_file: payment_file || null,
      khs_file: khs_file || null,
      status: 'pending'
    };

    // Ubah ke callback style
    db.query('INSERT INTO magang_registrations SET ?', magangData, (error, result) => {
      if (error) {
        console.error('Error in registerMagang:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server',
          error: error.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Pendaftaran magang berhasil',
        data: {
          id: result.insertId,
          nim: nim
        }
      });
    });

  } catch (error) {
    console.error('Error in registerMagang:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

exports.getMagangDataByNim = (req, res) => {
  try {
    const { nim } = req.params;

    if (!nim) {
      return res.status(400).json({
        success: false,
        message: 'Parameter NIM diperlukan'
      });
    }

    db.query(
      'SELECT * FROM magang_registrations WHERE nim = ?', 
      [nim],
      (error, results) => {
        if (error) {
          console.error('Error in getMagangDataByNim:', error);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Data magang tidak ditemukan'
          });
        }

        return res.json({
          success: true,
          data: results[0]
        });
      }
    );

  } catch (error) {
    console.error('Error in getMagangDataByNim:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};


exports.getAllMagangData = (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query pertama
    db.query('SELECT * FROM magang_registrations LIMIT ? OFFSET ?', [limit, offset], (error, results) => {
      if (error) {
        console.error('Error in getAllMagangData:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server',
          error: error.message
        });
      }

      // Query kedua
      db.query('SELECT COUNT(*) as total FROM magang_registrations', (countError, countResults) => {
        if (countError) {
          console.error('Error in getAllMagangData:', countError);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: countError.message
          });
        }

        return res.json({
          success: true,
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResults[0].total
          }
        });
      });
    });

  } catch (error) {
    console.error('Error in getAllMagangData:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};


exports.updateMagangStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID dan status diperlukan'
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid',
        valid_statuses: VALID_STATUSES
      });
    }

    db.query(
      'UPDATE magang_registrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id],
      (error, result) => {
        if (error) {
          console.error('Error in updateMagangStatus:', error);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Data magang tidak ditemukan'
          });
        }

        return res.json({
          success: true,
          message: 'Status magang berhasil diperbarui'
        });
      }
    );

  } catch (error) {
    console.error('Error in updateMagangStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

exports.deleteMagangData = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID diperlukan'
      });
    }

    db.query(
      'DELETE FROM magang_registrations WHERE id = ?',
      [id],
      (error, result) => {
        if (error) {
          console.error('Error in deleteMagangData:', error);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Data magang tidak ditemukan'
          });
        }

        return res.json({
          success: true,
          message: 'Data magang berhasil dihapus'
        });
      }
    );

  } catch (error) {
    console.error('Error in deleteMagangData:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};