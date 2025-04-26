const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');
const authmiddleware = require('../middlewares/authMiddleware');

router.get('/', authmiddleware, kegiatanController.getKegiatan);
router.post('/', authmiddleware, kegiatanController.addKegiatan);

module.exports = router;
