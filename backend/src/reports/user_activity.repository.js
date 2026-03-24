const User = require('../user/users.model');
const Session = require('../sessions/sessions.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class UserActivityRepository {
  static async getUserAuthActivity(userId) {
    try {
      const user = await User.findById(userId).select('name email createdAt').lean();
      if (!user) throw new ErrorHandler(404, 'User not found');

      const [loginCount, lastLogin] = await Promise.all([
        Session.countDocuments({ userId }),
        Session.findOne({ userId }).sort({ createdAt: -1 }).select('createdAt').lean(),
      ]);

      return {
        user: {
          userId: user._id.toString(),
          name: user.name || 'Unknown',
          email: user.email || '',
          registrationDate: user.createdAt || null,
        },
        auth: {
          loginCount,
          lastLoginAt: lastLogin?.createdAt || null,
        },
      };
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      throw new ErrorHandler(500, `Error fetching user auth activity: ${error.message}`);
    }
  }
}

module.exports = UserActivityRepository;

