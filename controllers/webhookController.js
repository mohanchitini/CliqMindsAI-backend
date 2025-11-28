const TrelloEvent = require('../models/TrelloEvent');

exports.handleTrelloWebhook = (req, res) => {
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    const webhookData = req.body;

    if (!webhookData.action) {
      return res.status(200).json({ received: true });
    }

    const action = webhookData.action;
    const actionType = action.type;

    let eventData = {
      eventType: actionType,
      cardId: null,
      cardName: null,
      listId: null,
      listName: null,
      boardId: null,
      boardName: null,
      payload: webhookData
    };

    if (action.data?.card) {
      eventData.cardId = action.data.card.id;
      eventData.cardName = action.data.card.name;
    }

    if (action.data?.list) {
      eventData.listId = action.data.list.id;
      eventData.listName = action.data.list.name;
    }

    if (action.data?.board) {
      eventData.boardId = action.data.board.id;
      eventData.boardName = action.data.board.name;
    }

    if (actionType.includes('card')) {
      TrelloEvent.create(eventData);
      console.log(`Trello event recorded: ${actionType} - ${eventData.cardName || 'Unknown'}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentEvents = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const events = TrelloEvent.getRecent(limit);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
