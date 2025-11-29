const UserDashboardRepository = require('./user_dashboard.repository');

class UserDashboardService {
  /**
   * Get user dashboard statistics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getUserDashboardStats(userId) {
    return UserDashboardRepository.getUserDashboardStats(userId);
  }
}

module.exports = UserDashboardService;

