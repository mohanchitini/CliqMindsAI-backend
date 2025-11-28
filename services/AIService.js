const axios = require('axios');
const config = require('../config/env');

class AIService {
  static async callOpenAI(messages, temperature = 0.7) {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  static async summarizeCard(cardData) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes Trello cards concisely.'
      },
      {
        role: 'user',
        content: `Please provide a brief summary of this Trello card:\n\nTitle: ${cardData.name}\nDescription: ${cardData.desc || 'No description'}\n\nProvide a concise 2-3 sentence summary.`
      }
    ];

    const summary = await this.callOpenAI(messages);
    return { summary };
  }

  static async generateSubtasks(cardData) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that breaks down tasks into actionable subtasks. Return the result as a JSON array of strings.'
      },
      {
        role: 'user',
        content: `Based on this Trello card, generate 3-5 actionable subtasks:\n\nTitle: ${cardData.name}\nDescription: ${cardData.desc || 'No description'}\n\nReturn only a JSON array of subtask strings.`
      }
    ];

    const result = await this.callOpenAI(messages, 0.5);
    
    try {
      const subtasks = JSON.parse(result);
      return { subtasks: Array.isArray(subtasks) ? subtasks : [result] };
    } catch (e) {
      const lines = result.split('\n').filter(line => line.trim());
      return { subtasks: lines };
    }
  }

  static async classifyPriority(cardData) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that classifies task priority. Respond with only one word: High, Medium, or Low.'
      },
      {
        role: 'user',
        content: `Classify the priority of this task:\n\nTitle: ${cardData.name}\nDescription: ${cardData.desc || 'No description'}\n\nRespond with only: High, Medium, or Low`
      }
    ];

    const priority = await this.callOpenAI(messages, 0.3);
    return { priority: priority.trim() };
  }

  static async extractTaskFromChat(text) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts task information from chat messages. Return a JSON object with "title" and "description" fields.'
      },
      {
        role: 'user',
        content: `Extract a task title and description from this message:\n\n"${text}"\n\nReturn only a JSON object with "title" and "description" fields.`
      }
    ];

    const result = await this.callOpenAI(messages, 0.5);
    
    try {
      return JSON.parse(result);
    } catch (e) {
      return {
        title: text.substring(0, 100),
        description: text
      };
    }
  }
}

module.exports = AIService;
