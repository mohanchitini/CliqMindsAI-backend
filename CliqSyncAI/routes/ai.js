const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/summarize', aiController.summarizeCard);
router.post('/subtasks', aiController.generateSubtasks);
router.post('/priority', aiController.classifyPriority);
router.post('/chat-to-task', aiController.chatToTask);

module.exports = router;
