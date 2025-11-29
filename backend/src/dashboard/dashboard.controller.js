const DashboardService = require('./dashboard.service');
const { asyncHandler } = require('../middleware/errorHandler');

class DashboardController {
  static getStatistics = asyncHandler(async (req, res) => {
    const statistics = await DashboardService.getStatistics();
    res.status(200).json({
      success: true,
      data: statistics
    });
  });
}

module.exports = DashboardController;

