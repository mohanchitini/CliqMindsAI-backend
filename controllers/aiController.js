const AIService = require('../services/AIService');
const TrelloService = require('../services/TrelloService');

const getUserId = (req) => {
  return req.query.userId || req.headers['x-user-id'] || 'default-user';
};

exports.summarizeCard = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const cardData = await TrelloService.getCardDetails(userId, cardId);
    const result = await AIService.summarizeCard(cardData);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateSubtasks = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const cardData = await TrelloService.getCardDetails(userId, cardId);
    const result = await AIService.generateSubtasks(cardData);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.classifyPriority = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const cardData = await TrelloService.getCardDetails(userId, cardId);
    const result = await AIService.classifyPriority(cardData);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.chatToTask = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { text, listId } = req.body;

    if (!text || !listId) {
      return res.status(400).json({ success: false, error: 'text and listId are required' });
    }

    const taskData = await AIService.extractTaskFromChat(text);
    const card = await TrelloService.createCard(userId, listId, taskData.title, taskData.description);

    res.json({ 
      success: true, 
      data: {
        extractedTask: taskData,
        createdCard: card
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
