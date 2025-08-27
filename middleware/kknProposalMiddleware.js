const multer = require('multer');
const path = require('path');

// Konfigurasi storage untuk file proposal KKN
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/kkn/proposals/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proposal-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter jenis file yang diizinkan
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan'), false);
    }
};

// Buat instance upload khusus proposal KKN
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: fileFilter
});

const proposalUpload = upload.single('proposal_file');

const processProposalData = (req, res, next) => {
    if (req.file) {
        req.body.proposal_file = req.file.filename;
        req.body.proposal_path = req.file.path;
    }
    
    next();
};

module.exports = { 
    proposalUpload: [proposalUpload, processProposalData]
};