const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/trello/start', authController.startTrelloAuth);
router.get('/trello/callback', authController.trelloCallback);
router.post('/trello/complete', authController.completeAuth);

module.exports = router;
