const UserDashboardService = require('./user_dashboard.service');
const { asyncHandler } = require('../middleware/errorHandler');

class UserDashboardController {
  /**
   * GET /dashboard/user/stats
   * Get user dashboard statistics
   */
  static getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const stats = await UserDashboardService.getUserDashboardStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

module.exports = UserDashboardController;

