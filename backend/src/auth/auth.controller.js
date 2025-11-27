const AuthService = require('./auth.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Auth Controller
 * HTTP request/response handlers
 * No business logic - delegates to service layer
 */
class AuthController {
  /**
   * POST /auth/signup
   * Send OTP for email verification during signup
   */
  static signup = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const result = await AuthService.sendSignupOTP(email, ip, userAgent);

    res.status(200).json(result);
  });

  /**
   * POST /auth/verify-otp
   * Verify OTP and create user account
   */
  static verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, name, password, phone } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const result = await AuthService.verifySignupOTP(
      email,
      otp,
      name,
      password,
      phone,
      ip,
      userAgent
    );

    res.status(201).json(result);
  });

  /**
   * POST /auth/login
   * Login with email and password
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const result = await AuthService.login(email, password, ip, userAgent);

    res.status(200).json(result);
  });

  /**
   * POST /auth/refresh
   * Regenerate access and refresh tokens
   */
  static refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const result = await AuthService.regenerateTokens(refreshToken, ip, userAgent);

    res.status(200).json(result);
  });

  /**
   * POST /auth/forgot-password
   * Send OTP for password reset
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const result = await AuthService.forgotPassword(email, ip, userAgent);

    res.status(200).json(result);
  });

  /**
   * POST /auth/reset-password
   * Reset password after verifying OTP
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const result = await AuthService.resetPassword(email, otp, newPassword, ip);

    res.status(200).json(result);
  });

  /**
   * POST /auth/change-password
   * Change password for authenticated user
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json(result);
  });

  /**
   * POST /auth/logout
   * Logout from current device
   */
  static logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await AuthService.logout(refreshToken);

    res.status(200).json(result);
  });

  /**
   * POST /auth/logout-all
   * Logout from all devices
   */
  static logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const result = await AuthService.logoutAllDevices(userId);

    res.status(200).json(result);
  });

  /**
   * GET /auth/me
   * Get current user profile
   */
  static getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const AuthRepository = require('./auth.repository');
    const user = await AuthRepository.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  });
}

module.exports = AuthController;
