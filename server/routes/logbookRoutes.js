const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, logbookController.getLogbookEntries);
router.post('/', authenticate, logbookController.saveLogbookEntries);

module.exports = router;
