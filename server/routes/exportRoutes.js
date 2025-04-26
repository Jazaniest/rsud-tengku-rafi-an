const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/logbook', authMiddleware, exportController.exportLogbook);

module.exports = router;
