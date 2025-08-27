const db = require('../db/db');

exports.getAllUsers = (req, res) => {
    db.query('SELECT nim, name, email, role FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: true, message: 'Gagal mengambil data user' });
        }
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    const userId = req.params.id;
    
    db.query('SELECT nim, name, email, role FROM users WHERE nim = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: true, message: 'Gagal mengambil data user' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: 'User tidak ditemukan' });
        }
        
        res.json(results[0]);
    });
};

exports.createUser = (req, res) => {
    const { nim, name, email, password, role } = req.body;
    
    if (!nim || !name || !email || !password || !role) {
        return res.status(400).json({ error: true, message: 'Semua field harus diisi' });
    }
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: true, message: 'Gagal membuat user' });
        }
        
        db.query(
            'INSERT INTO users (nim, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [nim, name, email, hashedPassword, role],
            (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: true, message: 'NIM atau email sudah terdaftar' });
                    }
                    console.error('Error creating user:', err);
                    return res.status(500).json({ error: true, message: 'Gagal membuat user' });
                }
                
                res.status(201).json({ 
                    success: true, 
                    message: 'User berhasil dibuat',
                    userId: nim
                });
            }
        );
    });
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !role) {
        return res.status(400).json({ error: true, message: 'Semua field harus diisi' });
    }
    
    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ error: true, message: 'Gagal mengupdate user' });
            }
            
            updateUserWithPassword(userId, name, email, hashedPassword, role, res);
        });
    } else {
        updateUserWithoutPassword(userId, name, email, role, res);
    }
};

function updateUserWithPassword(userId, name, email, password, role, res) {
    db.query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE nim = ?',
        [name, email, password, role, userId],
        (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: true, message: 'Email sudah terdaftar' });
                }
                console.error('Error updating user:', err);
                return res.status(500).json({ error: true, message: 'Gagal mengupdate user' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: true, message: 'User tidak ditemukan' });
            }
            
            res.json({ 
                success: true, 
                message: 'User berhasil diupdate',
                userId: userId
            });
        }
    );
}

function updateUserWithoutPassword(userId, name, email, role, res) {
    db.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE nim = ?',
        [name, email, role, userId],
        (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: true, message: 'Email sudah terdaftar' });
                }
                console.error('Error updating user:', err);
                return res.status(500).json({ error: true, message: 'Gagal mengupdate user' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: true, message: 'User tidak ditemukan' });
            }
            
            res.json({ 
                success: true, 
                message: 'User berhasil diupdate',
                userId: userId
            });
        }
    );
}

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    
    db.query('DELETE FROM users WHERE nim = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: true, message: 'Gagal menghapus user' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: 'User tidak ditemukan' });
        }
        
        res.json({ 
            success: true, 
            message: 'User berhasil dihapus'
        });
    });
};