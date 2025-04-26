const express = require('express');
const router = express.Router();
const subKegiatanController = require('../controllers/subKegiatanController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, subKegiatanController.getSubKegiatan);
router.post('/', authenticate, subKegiatanController.addSubKegiatan);

module.exports = router;
