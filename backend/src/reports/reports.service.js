const ReportsRepository = require('./reports.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

class ReportsService {
  /**
   * Get top performers
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async getTopPerformers(options = {}) {
    try {
      const performers = await ReportsRepository.getTopPerformers(options);
      return {
        success: true,
        data: performers,
        count: performers.length
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error getting top performers: ${error.message}`);
    }
  }

  /**
   * Get user rank and comparison
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async getUserRankAndComparison(userId, options = {}) {
    try {
      const data = await ReportsRepository.getUserRankAndComparison(userId, options);
      return {
        success: true,
        data
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error getting user rank: ${error.message}`);
    }
  }

  /**
   * Get quiz leaderboard
   * @param {string} quizId
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  static async getQuizLeaderboard(quizId, limit = 10) {
    try {
      const leaderboard = await ReportsRepository.getQuizLeaderboard(quizId, limit);
      return {
        success: true,
        data: leaderboard,
        count: leaderboard.length
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error getting quiz leaderboard: ${error.message}`);
    }
  }

  /**
   * Get batch statistics
   * @param {string} batchId
   * @returns {Promise<Object>}
   */
  static async getBatchStatistics(batchId) {
    try {
      const stats = await ReportsRepository.getBatchStatistics(batchId);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error getting batch statistics: ${error.message}`);
    }
  }
}

module.exports = ReportsService;

