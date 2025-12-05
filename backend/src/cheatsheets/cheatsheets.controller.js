const CheatSheetService = require('./cheatsheets.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * CheatSheet Controller
 * HTTP handlers for cheatsheet endpoints
 */
class CheatSheetController {
  /**
   * POST /cheatsheets
   * Create cheatsheet
   */
  static createCheatSheet = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const cheatsheet = await CheatSheetService.createCheatSheet(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'CheatSheet created successfully',
      data: cheatsheet
    });
  });

  /**
   * GET /cheatsheets/topic/:topicId
   * Get cheatsheet by topic ID
   */
  static getCheatSheetByTopicId = asyncHandler(async (req, res) => {
    const cheatsheet = await CheatSheetService.getCheatSheetByTopicId(req.params.topicId);

    if (!cheatsheet) {
      // Return 200 with success: false instead of 404, as cheatsheets are optional
      return res.status(200).json({
        success: false,
        message: 'CheatSheet not found for this topic',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: cheatsheet
    });
  });

  /**
   * GET /cheatsheets/:id
   * Get cheatsheet by ID
   */
  static getCheatSheetById = asyncHandler(async (req, res) => {
    const cheatsheet = await CheatSheetService.getCheatSheetById(req.params.id);

    res.status(200).json({
      success: true,
      data: cheatsheet
    });
  });

  /**
   * PUT /cheatsheets/:id
   * Update cheatsheet
   */
  static updateCheatSheet = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const cheatsheet = await CheatSheetService.updateCheatSheet(req.params.id, req.body, userId);

    res.status(200).json({
      success: true,
      message: 'CheatSheet updated successfully',
      data: cheatsheet
    });
  });

  /**
   * DELETE /cheatsheets/:id
   * Delete cheatsheet
   */
  static deleteCheatSheet = asyncHandler(async (req, res) => {
    await CheatSheetService.deleteCheatSheet(req.params.id);

    res.status(200).json({
      success: true,
      message: 'CheatSheet deleted successfully'
    });
  });
}

module.exports = CheatSheetController;

