const TrelloService = require('../services/TrelloService');

const getUserId = (req) => {
  return req.query.userId || req.headers['x-user-id'] || 'default-user';
};

exports.getBoards = async (req, res) => {
  try {
    const userId = getUserId(req);
    const boards = await TrelloService.getBoards(userId);
    res.json({ success: true, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLists = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { board } = req.query;

    if (!board) {
      return res.status(400).json({ success: false, error: 'board parameter is required' });
    }

    const lists = await TrelloService.getLists(userId, board);
    res.json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { list } = req.query;

    if (!list) {
      return res.status(400).json({ success: false, error: 'list parameter is required' });
    }

    const cards = await TrelloService.getCards(userId, list);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCardDetails = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.params;

    const card = await TrelloService.getCardDetails(userId, cardId);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { listId, title, description } = req.body;

    if (!listId || !title) {
      return res.status(400).json({ success: false, error: 'listId and title are required' });
    }

    const card = await TrelloService.createCard(userId, listId, title, description);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.params;
    const updates = req.body;

    const card = await TrelloService.updateCard(userId, cardId, updates);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cardId } = req.params;
    const { targetListId } = req.body;

    if (!targetListId) {
      return res.status(400).json({ success: false, error: 'targetListId is required' });
    }

    const card = await TrelloService.moveCard(userId, cardId, targetListId);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
