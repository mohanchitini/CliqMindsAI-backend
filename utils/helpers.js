const crypto = require('crypto');

function generateRandomString(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

module.exports = {
  generateRandomString,
  validateEmail,
  formatDate
};
