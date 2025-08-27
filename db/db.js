const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) {
        console.error('❌ Gagal koneksi ke database:', err.message);
        process.exit(1); // stop app kalau koneksi gagal
    } else {
        console.log('✅ Terhubung ke database MySQL di XAMPP (database Yadika)');
    }
});

module.exports = db;
