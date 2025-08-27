const express = require("express");
const router = express.Router();
const proposalController = require("../controller/proposalController");
const multer = require("multer");
const path = require("path");

// Setup multer (upload PDF)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/kkn");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== ".pdf") {
            return cb(new Error("Hanya file PDF yang diperbolehkan"));
        }
        cb(null, true);
    }
});

// Routes
router.post("/proposals", upload.single("proposal_file"), proposalController.createProposal);
router.get("/proposals/status/:nim", proposalController.getLatestProposal);

module.exports = router;
