const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/kkn/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});

const handleFormData = (req, res, next) => {
    // Text fields sudah otomatis tersedia di req.body
    // Gabungkan dengan file
    req.body = {
        ...req.body, // Ini berisi semua field text (nim, phone, dll)
        ...(req.files?.krs?.[0] && { 
            krs_file: req.files.krs[0].filename,
            krs_path: req.files.krs[0].path 
        }),
        ...(req.files?.payment?.[0] && { 
            payment_file: req.files.payment[0].filename,
            payment_path: req.files.payment[0].path 
        }),
        ...(req.files?.khs?.[0] && { 
            khs_file: req.files.khs[0].filename,
            khs_path: req.files.khs[0].path 
        })
    };
    next();
};

const kknUpload = upload.fields([
    { name: 'krs', maxCount: 1 },
    { name: 'payment', maxCount: 1 },
    { name: 'khs', maxCount: 1 }
]);

module.exports = { 
    kknUpload: [kknUpload, handleFormData]
};