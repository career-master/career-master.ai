const DashboardRepository = require('./dashboard.repository');

class DashboardService {
  static async getStatistics() {
    return DashboardRepository.getStatistics();
  }
}

module.exports = DashboardService;

