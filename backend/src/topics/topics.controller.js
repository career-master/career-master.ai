const TopicService = require('./topics.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Topic Controller
 * HTTP handlers for topic endpoints
 */
class TopicController {
  /**
   * POST /topics
   * Create topic
   */
  static createTopic = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const topic = await TopicService.createTopic(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic
    });
  });

  /**
   * GET /topics
   * List all topics (optionally filtered by subjectId)
   */
  static getTopics = asyncHandler(async (req, res) => {
    const { subjectId, isActive, parentTopicId } = req.query;
    
    let topics;
    if (subjectId) {
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true' || isActive === true;
      }
      // parentTopicId: 'roots' or 'null' or '' => only root topics (no parent)
      if (parentTopicId === 'roots' || parentTopicId === 'null' || parentTopicId === '') {
        filter.$or = [
          { parentTopicId: null },
          { parentTopicId: { $exists: false } }
        ];
      } else if (parentTopicId) {
        filter.parentTopicId = parentTopicId;
      }
      topics = await TopicService.getTopicsBySubjectId(subjectId, filter);
    } else {
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true' || isActive === true;
      }
      if (parentTopicId === 'roots' || parentTopicId === 'null' || parentTopicId === '') {
        filter.$or = [
          { parentTopicId: null },
          { parentTopicId: { $exists: false } }
        ];
      } else if (parentTopicId) {
        filter.parentTopicId = parentTopicId;
      }
      topics = await TopicService.getTopics(filter);
    }

    res.status(200).json({
      success: true,
      data: topics
    });
  });

  /**
   * GET /topics/:id
   * Get topic by ID
   */
  static getTopicById = asyncHandler(async (req, res) => {
    const topic = await TopicService.getTopicById(req.params.id);

    res.status(200).json({
      success: true,
      data: topic
    });
  });

  /**
   * PUT /topics/:id
   * Update topic
   */
  static updateTopic = asyncHandler(async (req, res) => {
    const topic = await TopicService.updateTopic(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic
    });
  });

  /**
   * DELETE /topics/:id
   * Delete topic
   */
  static deleteTopic = asyncHandler(async (req, res) => {
    await TopicService.deleteTopic(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  });

  /**
   * PUT /topics/orders
   * Bulk update topic orders
   */
  static bulkUpdateOrders = asyncHandler(async (req, res) => {
    const { orders } = req.body;
    await TopicService.bulkUpdateOrders(orders);

    res.status(200).json({
      success: true,
      message: 'Topic orders updated successfully'
    });
  });
}

module.exports = TopicController;

