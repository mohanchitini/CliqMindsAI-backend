const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.get('/recent', webhookController.getRecentEvents);

module.exports = router;
