const express = require('express');
const router = express.Router();
const villageController = require('../controller/villageController');

// Pastikan path-nya benar
router.get('/', villageController.getAllVillages);
router.post('/', villageController.createVillage);
router.put('/:villageName', villageController.updateVillage);
router.delete('/:villageName', villageController.deleteVillage);

module.exports = router;