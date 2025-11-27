const db = require('../config/database');

class User {
  static findByUserId(userId) {
    const stmt = db.prepare('SELECT * FROM users WHERE userId = ?');
    return stmt.get(userId);
  }

  static create(userId, trelloAccessToken, trelloRefreshToken = null, expiresAt = null) {
    const stmt = db.prepare(`
      INSERT INTO users (userId, trelloAccessToken, trelloRefreshToken, expiresAt)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(userId, trelloAccessToken, trelloRefreshToken, expiresAt);
    return result.lastInsertRowid;
  }

  static updateToken(userId, trelloAccessToken, trelloRefreshToken = null, expiresAt = null) {
    const stmt = db.prepare(`
      UPDATE users 
      SET trelloAccessToken = ?, 
          trelloRefreshToken = ?, 
          expiresAt = ?,
          updatedAt = strftime('%s', 'now')
      WHERE userId = ?
    `);
    return stmt.run(trelloAccessToken, trelloRefreshToken, expiresAt, userId);
  }

  static upsert(userId, trelloAccessToken, trelloRefreshToken = null, expiresAt = null) {
    const existing = this.findByUserId(userId);
    if (existing) {
      this.updateToken(userId, trelloAccessToken, trelloRefreshToken, expiresAt);
    } else {
      this.create(userId, trelloAccessToken, trelloRefreshToken, expiresAt);
    }
  }
}

module.exports = User;
