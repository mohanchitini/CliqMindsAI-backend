const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    trelloAccessToken TEXT,
    trelloRefreshToken TEXT,
    expiresAt INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trello_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventType TEXT NOT NULL,
    cardId TEXT,
    cardName TEXT,
    listId TEXT,
    listName TEXT,
    boardId TEXT,
    boardName TEXT,
    payload TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

module.exports = db;
