const express = require('express');
const router = express.Router();
const magangController = require('../controller/magangController');
const { magangUpload } = require('../middleware/magangMiddleware'); // Ganti dengan middleware baru


router.post('/', magangUpload, magangController.registerMagang);
router.get('/:nim', magangController.getMagangDataByNim);
router.get('/', magangController.getAllMagangData);
router.put('/:id/status', magangController.updateMagangStatus);

module.exports = router;