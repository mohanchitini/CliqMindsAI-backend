require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  trello: {
    key: process.env.TRELLO_KEY,
    secret: process.env.TRELLO_SECRET,
    redirectUri: process.env.TRELLO_REDIRECT_URI
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  db: {
    path: process.env.DB_PATH || './database.sqlite'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
  }
};
