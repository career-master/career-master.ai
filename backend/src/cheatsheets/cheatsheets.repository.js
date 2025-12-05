const CheatSheet = require('./cheatsheets.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * CheatSheet Repository
 * Pure database operations for cheatsheets
 */
class CheatSheetRepository {
  /**
   * Create new cheatsheet
   * @param {Object} cheatsheetData
   * @returns {Promise<Object>}
   */
  static async createCheatSheet(cheatsheetData) {
    try {
      const cheatsheet = new CheatSheet(cheatsheetData);
      const savedCheatSheet = await cheatsheet.save();
      return savedCheatSheet;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `CheatSheet validation failed: ${validationErrors}`);
      }
      if (error.code === 11000) {
        throw new ErrorHandler(400, 'A cheatsheet already exists for this topic');
      }
      throw new ErrorHandler(500, `Error creating cheatsheet: ${error.message}`);
    }
  }

  /**
   * Update cheatsheet
   * @param {string} cheatsheetId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateCheatSheet(cheatsheetId, updates) {
    try {
      const cheatsheet = await CheatSheet.findByIdAndUpdate(cheatsheetId, updates, {
        new: true,
        runValidators: true
      });
      return cheatsheet;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `CheatSheet validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating cheatsheet: ${error.message}`);
    }
  }

  /**
   * Get cheatsheet by ID
   * @param {string} cheatsheetId
   * @returns {Promise<Object|null>}
   */
  static async getCheatSheetById(cheatsheetId) {
    try {
      return await CheatSheet.findById(cheatsheetId);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching cheatsheet: ${error.message}`);
    }
  }

  /**
   * Get cheatsheet by topic ID
   * @param {string} topicId
   * @returns {Promise<Object|null>}
   */
  static async getCheatSheetByTopicId(topicId) {
    try {
      return await CheatSheet.findOne({ topicId });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching cheatsheet: ${error.message}`);
    }
  }

  /**
   * Delete cheatsheet
   * @param {string} cheatsheetId
   * @returns {Promise<void>}
   */
  static async deleteCheatSheet(cheatsheetId) {
    try {
      await CheatSheet.findByIdAndDelete(cheatsheetId);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting cheatsheet: ${error.message}`);
    }
  }
}

module.exports = CheatSheetRepository;

