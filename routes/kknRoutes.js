const express = require('express');
const router = express.Router();
const { kknUpload } = require('../middleware/uploadMiddleware');
const kknController = require('../controller/kknController');

router.use(express.urlencoded({ extended: true }));

router.post('/kkn', kknUpload, kknController.registerKKN);
router.get('/kkn/quota', kknController.getVillageQuotas);
router.get('/kkn/:user_id', kknController.getKKNData);
router.get('/kkn', kknController.getAllKKNData);
router.put('/kkn/:id/status', kknController.updateKKNStatus);


module.exports = router;