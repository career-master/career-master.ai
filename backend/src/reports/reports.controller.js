const ReportsService = require('./reports.service');
const QuizReportService = require('./quiz_report.service');
const { ErrorHandler } = require('../middleware/errorHandler');

class ReportsController {
  /**
   * Get top performers/leaderboard
   * GET /api/reports/top-performers
   */
  static async getTopPerformers(req, res, next) {
    try {
      const {
        limit = 10,
        quizId = null,
        batchId = null,
        sortBy = 'averageScore'
      } = req.query;

      const result = await ReportsService.getTopPerformers({
        limit: parseInt(limit),
        quizId: quizId || null,
        batchId: batchId || null,
        sortBy
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user rank and comparison
   * GET /api/reports/user-rank/:userId
   */
  static async getUserRankAndComparison(req, res, next) {
    try {
      const { userId } = req.params;
      const { quizId = null, batchId = null } = req.query;

      const result = await ReportsService.getUserRankAndComparison(userId, {
        quizId: quizId || null,
        batchId: batchId || null
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz leaderboard
   * GET /api/reports/quiz-leaderboard/:quizId
   */
  static async getQuizLeaderboard(req, res, next) {
    try {
      const { quizId } = req.params;
      const { limit = 10 } = req.query;

      const result = await ReportsService.getQuizLeaderboard(
        quizId,
        parseInt(limit)
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get batch statistics
   * GET /api/reports/batch-statistics/:batchId
   */
  static async getBatchStatistics(req, res, next) {
    try {
      const { batchId } = req.params;

      const result = await ReportsService.getBatchStatistics(batchId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz attempt report with correct answers
   * GET /api/reports/quiz-attempt/:attemptId
   */
  static async getQuizAttemptReport(req, res, next) {
    try {
      const { attemptId } = req.params;
      const reqUser = req.user;

      if (!reqUser) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const isSuperAdmin = Array.isArray(reqUser.roles) && reqUser.roles.includes('super_admin');

      const result = isSuperAdmin
        ? await QuizReportService.getQuizAttemptReportForAdmin(attemptId)
        : await QuizReportService.getQuizAttemptReport(attemptId, reqUser.userId || reqUser._id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download PDF report
   * GET /api/reports/quiz-attempt/:attemptId/pdf
   */
  static async downloadPDFReport(req, res, next) {
    try {
      const { attemptId } = req.params;
      const reqUser = req.user;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message: 'Attempt ID is required'
        });
      }

      if (!reqUser) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const isSuperAdmin = Array.isArray(reqUser.roles) && reqUser.roles.includes('super_admin');

      console.log(
        `Downloading PDF report - attemptId: ${attemptId}, userId: ${reqUser.userId}, superAdmin: ${isSuperAdmin}`
      );

      const pdfBuffer = isSuperAdmin
        ? await QuizReportService.generatePDFReportForAdmin(attemptId)
        : await QuizReportService.generatePDFReport(attemptId, reqUser.userId || reqUser._id);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF report'
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="quiz-report-${attemptId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in downloadPDFReport controller:', error);
      next(error);
    }
  }

  /**
   * Download Excel report
   * GET /api/reports/quiz-attempt/:attemptId/excel
   */
  static async downloadExcelReport(req, res, next) {
    try {
      const { attemptId } = req.params;
      const reqUser = req.user;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message: 'Attempt ID is required'
        });
      }

      if (!reqUser) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const isSuperAdmin = Array.isArray(reqUser.roles) && reqUser.roles.includes('super_admin');

      const excelBuffer = isSuperAdmin
        ? await QuizReportService.generateExcelReportForAdmin(attemptId)
        : await QuizReportService.generateExcelReport(attemptId, reqUser.userId || reqUser._id);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="quiz-report-${attemptId}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's quiz attempts
   * GET /api/reports/user-quiz-attempts
   */
  static async getUserQuizAttempts(req, res, next) {
    try {
      const userId = req.user?._id || req.user?.userId;
      const { 
        quizId, 
        subjectId, 
        topicId, 
        dateFrom, 
        dateTo, 
        minScore, 
        maxScore, 
        difficulty 
      } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const filters = {};
      if (quizId) filters.quizId = quizId;
      if (subjectId) filters.subjectId = subjectId;
      if (topicId) filters.topicId = topicId;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (minScore !== undefined) filters.minScore = parseFloat(minScore);
      if (maxScore !== undefined) filters.maxScore = parseFloat(maxScore);
      if (difficulty) filters.difficulty = difficulty;

      console.log(`Getting quiz attempts for user: ${userId}`, filters);

      const result = await QuizReportService.getUserQuizAttempts(userId, filters);

      console.log(`Returning ${result.data?.length || 0} quiz attempts`);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getUserQuizAttempts controller:', error);
      next(error);
    }
  }

  /**
   * Admin: Get quiz attempts across users
   * GET /api/reports/admin/user-quiz-attempts
   */
  static async getAdminUserQuizAttempts(req, res, next) {
    try {
      const reqUser = req.user;
      if (!reqUser || !Array.isArray(reqUser.roles) || !reqUser.roles.includes('super_admin')) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      const {
        subjectId,
        quizId,
        domain,
        category,
        topicId,
        email,
        name,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {};
      if (subjectId) filters.subjectId = subjectId;
      if (quizId) filters.quizId = quizId;
      if (domain) filters.domain = domain;
      if (category) filters.category = category;
      if (topicId) filters.topicId = topicId;
      if (email) filters.email = email;
      if (name) filters.name = name;

      const pagination = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      };

      const result = await QuizReportService.getAdminUserQuizAttempts(filters, pagination);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAdminUserQuizAttempts controller:', error);
      next(error);
    }
  }

  /**
   * Delete a user's own quiz attempt
   * DELETE /api/reports/quiz-attempt/:attemptId
   */
  static async deleteUserQuizAttempt(req, res, next) {
    try {
      const reqUser = req.user;
      const { attemptId } = req.params;

      const userId = reqUser?._id || reqUser?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message: 'Attempt ID is required',
        });
      }

      await QuizReportService.deleteUserQuizAttempt(userId, attemptId);

      return res.status(200).json({
        success: true,
        message: 'Quiz attempt deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteUserQuizAttempt controller:', error);
      next(error);
    }
  }

  /**
   * Admin: Delete any quiz attempt (super_admin only)
   * DELETE /api/reports/admin/quiz-attempt/:attemptId
   */
  static async deleteAdminQuizAttempt(req, res, next) {
    try {
      const reqUser = req.user;
      const { attemptId } = req.params;

      if (!reqUser || !Array.isArray(reqUser.roles) || !reqUser.roles.includes('super_admin')) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message: 'Attempt ID is required',
        });
      }

      await QuizReportService.deleteAdminQuizAttempt(attemptId);

      return res.status(200).json({
        success: true,
        message: 'Quiz attempt deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteAdminQuizAttempt controller:', error);
      next(error);
    }
  }
}

module.exports = ReportsController;

