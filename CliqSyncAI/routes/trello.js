const express = require('express');
const router = express.Router();
const trelloController = require('../controllers/trelloController');

router.get('/boards', trelloController.getBoards);
router.get('/lists', trelloController.getLists);
router.get('/cards', trelloController.getCards);
router.get('/cards/:cardId', trelloController.getCardDetails);
router.post('/cards', trelloController.createCard);
router.patch('/cards/:cardId', trelloController.updateCard);
router.post('/cards/:cardId/move', trelloController.moveCard);

module.exports = router;
