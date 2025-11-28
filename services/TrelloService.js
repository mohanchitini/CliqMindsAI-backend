const axios = require('axios');
const User = require('../models/User');
const config = require('../../config/env');

class TrelloService {
  static async getUserToken(userId) {
    const user = User.findByUserId(userId);
    if (!user || !user.trelloAccessToken) {
      throw new Error('User not authenticated with Trello');
    }
    return user.trelloAccessToken;
  }

  static async makeRequest(userId, method, endpoint, data = null) {
    const token = await this.getUserToken(userId);
    const url = `https://api.trello.com/1${endpoint}`;
    
    const params = {
      key: config.trello.key,
      token: token
    };

    try {
      const response = await axios({
        method,
        url,
        params,
        data
      });
      return response.data;
    } catch (error) {
      throw new Error(`Trello API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  static async getBoards(userId) {
    return await this.makeRequest(userId, 'GET', '/members/me/boards');
  }

  static async getLists(userId, boardId) {
    return await this.makeRequest(userId, 'GET', `/boards/${boardId}/lists`);
  }

  static async getCards(userId, listId) {
    return await this.makeRequest(userId, 'GET', `/lists/${listId}/cards`);
  }

  static async getCardDetails(userId, cardId) {
    return await this.makeRequest(userId, 'GET', `/cards/${cardId}`);
  }

  static async createCard(userId, listId, title, description = '') {
    return await this.makeRequest(userId, 'POST', '/cards', {
      idList: listId,
      name: title,
      desc: description
    });
  }

  static async updateCard(userId, cardId, updates) {
    return await this.makeRequest(userId, 'PUT', `/cards/${cardId}`, updates);
  }

  static async moveCard(userId, cardId, targetListId) {
    return await this.makeRequest(userId, 'PUT', `/cards/${cardId}`, {
      idList: targetListId
    });
  }
}

module.exports = TrelloService;
