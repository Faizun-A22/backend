const db = require('../db/db');

exports.login = (req, res) => {
    console.log('Received login request:', req.body);
    const { email, password, isAdmin } = req.body;

    const roleCheck = isAdmin ? 'admin' : 'user';
    db.query(
        'SELECT * FROM users WHERE email = ? AND role = ?',
        [email, roleCheck],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            const user = results[0];
            
            // Bandingkan password langsung (tanpa bcrypt)
            if (password !== user.password) {
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            // Kembalikan semua data user yang diperlukan
            res.json({
                success: true,
                message: `Login berhasil`,
                token: 'generated-token', // Anda perlu implementasi JWT
                user: {
                    nim: user.nim,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
    );
};

exports.register = (req, res) => {
    const { nim, name, email, password } = req.body;

    // Cek nim atau email sudah ada
    db.query('SELECT * FROM users WHERE nim = ? OR email = ?', [nim, email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        if (results.length > 0) {
            return res.status(400).json({ message: 'NIM atau Email sudah terdaftar' });
        }

        db.query(
            'INSERT INTO users (nim, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [nim, name, email, password, 'user'],
            (err) => {
                if (err) return res.status(500).json({ message: 'Server error', error: err });
                res.json({ message: 'Pendaftaran berhasil' });
            }
        );
    });
};
