const AnnouncementsService = require('./announcements.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Announcements Controller
 * HTTP handlers for announcements endpoints
 */
class AnnouncementsController {
  /**
   * GET /announcements
   * Public: list announcements for homepage
   */
  static getPublicAnnouncements = asyncHandler(async (req, res) => {
    const { type, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    const items = await AnnouncementsService.getPublicAnnouncements({
      type,
      limit: parsedLimit
    });

    res.status(200).json({
      success: true,
      data: items
    });
  });

  /**
   * GET /announcements/admin
   * Admin: paginated list
   */
  static getAdminAnnouncements = asyncHandler(async (req, res) => {
    const { type, isActive, page, limit } = req.query;

    const result = await AnnouncementsService.getAdminAnnouncements({
      type,
      isActive,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined
    });

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * POST /announcements
   * Admin: create announcement
   */
  static createAnnouncement = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const doc = await AnnouncementsService.createAnnouncement(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: doc
    });
  });

  /**
   * GET /announcements/:id
   * Admin: get announcement by ID
   */
  static getAnnouncementById = asyncHandler(async (req, res) => {
    const doc = await AnnouncementsService.getAnnouncementById(req.params.id);
    res.status(200).json({
      success: true,
      data: doc
    });
  });

  /**
   * PUT /announcements/:id
   * Admin: update announcement
   */
  static updateAnnouncement = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const doc = await AnnouncementsService.updateAnnouncement(req.params.id, req.body, userId);

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: doc
    });
  });

  /**
   * DELETE /announcements/:id
   * Admin: delete announcement
   */
  static deleteAnnouncement = asyncHandler(async (req, res) => {
    await AnnouncementsService.deleteAnnouncement(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  });
}

module.exports = AnnouncementsController;

