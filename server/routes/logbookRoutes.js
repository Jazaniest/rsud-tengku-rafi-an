const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/user', authenticate, logbookController.getLogbookEntries);
router.post('/save', authenticate, logbookController.saveLogbookEntries);
router.get('/list', authenticate, logbookController.getUserLogbook)

module.exports = router;
