const SubjectService = require('./subjects.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Subject Controller
 * HTTP handlers for subject endpoints
 */
class SubjectController {
  /**
   * POST /subjects
   * Create subject
   */
  static createSubject = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const subject = await SubjectService.createSubject(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  });

  /**
   * GET /subjects
   * List all subjects
   */
  static getSubjects = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { isActive, category, level } = req.query;

    const result = await SubjectService.getSubjectsPaginated({
      page,
      limit,
      isActive,
      category,
      level
    });

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * GET /subjects/:id
   * Get subject by ID
   */
  static getSubjectById = asyncHandler(async (req, res) => {
    const includeTopics = req.query.includeTopics === 'true';
    const subject = await SubjectService.getSubjectById(req.params.id, includeTopics);

    res.status(200).json({
      success: true,
      data: subject
    });
  });

  /**
   * PUT /subjects/:id
   * Update subject
   */
  static updateSubject = asyncHandler(async (req, res) => {
    const subject = await SubjectService.updateSubject(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  });

  /**
   * DELETE /subjects/:id
   * Delete subject
   */
  static deleteSubject = asyncHandler(async (req, res) => {
    await SubjectService.deleteSubject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  });

  /**
   * PUT /subjects/orders
   * Bulk update subject orders
   */
  static bulkUpdateOrders = asyncHandler(async (req, res) => {
    const { orders } = req.body;
    await SubjectService.bulkUpdateOrders(orders);

    res.status(200).json({
      success: true,
      message: 'Subject orders updated successfully'
    });
  });
}

module.exports = SubjectController;

