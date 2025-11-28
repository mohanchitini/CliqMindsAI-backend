const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/trello', webhookController.handleTrelloWebhook);
router.head('/trello', webhookController.handleTrelloWebhook);

module.exports = router;
