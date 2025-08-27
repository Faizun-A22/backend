const db = require('../db/db');
const path = require("path");
const fs = require("fs");

// Tambah proposal
exports.createProposal = (req, res) => {
    const { nim, village, work_program, budget } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "File proposal wajib diupload" });
    }

    const sql = `
        INSERT INTO kkn_proposal (nim, village_name, work_program, budget, proposal_file)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [nim, village, work_program, budget, file.filename], (err, result) => {
        if (err) {
            console.error("Error insert proposal:", err);
            return res.status(500).json({ message: "Gagal menyimpan proposal" });
        }
        res.json({ message: "Proposal berhasil diajukan" });
    });
};

// Ambil status proposal terakhir
// Ambil status proposal terakhir
exports.getLatestProposal = (req, res) => {
    const { nim } = req.params;
    console.log('Mencari proposal untuk NIM:', nim); // ← TAMBAH INI
    
    const sql = `
        SELECT * FROM kkn_proposal
        WHERE nim = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;
    
    db.query(sql, [nim], (err, rows) => {
        if (err) {
            console.error("Error ambil status proposal:", err);
            return res.status(500).json({ message: "Gagal ambil status" });
        }
        
        console.log('Hasil query:', rows); // ← TAMBAH INI
        
        if (rows.length === 0) {
            console.log('Tidak ada proposal untuk NIM:', nim); // ← TAMBAH INI
            return res.status(404).json({ message: "Belum ada proposal" });
        }
        
        res.json(rows[0]);
    });
};
