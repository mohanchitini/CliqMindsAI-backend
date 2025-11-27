const db = require('../config/database');

class TrelloEvent {
  static create(eventData) {
    const stmt = db.prepare(`
      INSERT INTO trello_events (eventType, cardId, cardName, listId, listName, boardId, boardName, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      eventData.eventType,
      eventData.cardId,
      eventData.cardName,
      eventData.listId,
      eventData.listName,
      eventData.boardId,
      eventData.boardName,
      JSON.stringify(eventData.payload)
    );
    return result.lastInsertRowid;
  }

  static getRecent(limit = 20) {
    const stmt = db.prepare(`
      SELECT * FROM trello_events 
      ORDER BY createdAt DESC 
      LIMIT ?
    `);
    const events = stmt.all(limit);
    return events.map(event => ({
      ...event,
      payload: JSON.parse(event.payload)
    }));
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM trello_events ORDER BY createdAt DESC');
    const events = stmt.all();
    return events.map(event => ({
      ...event,
      payload: JSON.parse(event.payload)
    }));
  }
}

module.exports = TrelloEvent;
