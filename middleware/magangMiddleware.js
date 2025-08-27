// middleware/magangMiddleware.js
const multer = require('multer');
const path = require('path');

// Konfigurasi storage untuk file magang
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/magang/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = path.parse(file.originalname).name;
        cb(null, `magang-${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Filter jenis file yang diizinkan
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file PDF, JPG, dan PNG yang diperbolehkan'));
    }
};

// Buat instance upload khusus magang
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: fileFilter
});

const magangUpload = upload.fields([
    { name: 'work_certificate', maxCount: 1 },
    { name: 'krs', maxCount: 1 },
    { name: 'payment_proof', maxCount: 1 },
    { name: 'khs', maxCount: 1 }
]);


const processMagangData = (req, res, next) => {
    req.body = {
        ...req.body,
        ...(req.files?.work_certificate?.[0] && { 
            work_certificate_file: req.files.work_certificate[0].filename,
            work_certificate_path: req.files.work_certificate[0].path 
        }),
        ...(req.files?.krs?.[0] && { 
            krs_file: req.files.krs[0].filename,
            krs_path: req.files.krs[0].path 
        }),
        ...(req.files?.payment_proof?.[0] && { 
            payment_file: req.files.payment_proof[0].filename,
            payment_path: req.files.payment_proof[0].path 
        }),
        ...(req.files?.khs?.[0] && { 
            khs_file: req.files.khs[0].filename,
            khs_path: req.files.khs[0].path 
        })
    };
    
    next();
};

module.exports = { 
    magangUpload: [magangUpload, processMagangData]
};