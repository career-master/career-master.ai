const CheatSheetRepository = require('./cheatsheets.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * CheatSheet Service
 * Business logic for cheatsheet management
 */
class CheatSheetService {
  /**
   * Create cheatsheet
   * @param {Object} payload
   * @param {string} userId
   */
  static async createCheatSheet(payload, userId) {
    if (!userId) {
      throw new ErrorHandler(401, 'User ID is required to create a cheatsheet');
    }

    const { topicId, content, contentType, estReadMinutes, resources } = payload;

    const cheatsheetData = {
      topicId,
      content,
      contentType: contentType || 'html',
      estReadMinutes: estReadMinutes || 5,
      resources: resources || [],
      createdBy: userId
    };

    return await CheatSheetRepository.createCheatSheet(cheatsheetData);
  }

  /**
   * Update cheatsheet
   * @param {string} cheatsheetId
   * @param {Object} payload
   * @param {string} userId
   */
  static async updateCheatSheet(cheatsheetId, payload, userId) {
    const updates = { ...payload, updatedBy: userId };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const cheatsheet = await CheatSheetRepository.updateCheatSheet(cheatsheetId, updates);
    if (!cheatsheet) {
      throw new ErrorHandler(404, 'CheatSheet not found');
    }
    return cheatsheet;
  }

  /**
   * Get cheatsheet by ID
   * @param {string} cheatsheetId
   */
  static async getCheatSheetById(cheatsheetId) {
    const cheatsheet = await CheatSheetRepository.getCheatSheetById(cheatsheetId);
    if (!cheatsheet) {
      throw new ErrorHandler(404, 'CheatSheet not found');
    }
    return cheatsheet;
  }

  /**
   * Get cheatsheet by topic ID
   * @param {string} topicId
   */
  static async getCheatSheetByTopicId(topicId) {
    return await CheatSheetRepository.getCheatSheetByTopicId(topicId);
  }

  /**
   * Delete cheatsheet
   * @param {string} cheatsheetId
   */
  static async deleteCheatSheet(cheatsheetId) {
    const cheatsheet = await CheatSheetRepository.getCheatSheetById(cheatsheetId);
    if (!cheatsheet) {
      throw new ErrorHandler(404, 'CheatSheet not found');
    }
    await CheatSheetRepository.deleteCheatSheet(cheatsheetId);
  }
}

module.exports = CheatSheetService;

