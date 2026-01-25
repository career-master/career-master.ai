const TopicRepository = require('./topics.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Topic Service
 * Business logic for topic management
 */
class TopicService {
  /**
   * Create topic
   * @param {Object} payload
   * @param {string} userId
   */
  static async createTopic(payload, userId) {
    if (!userId) {
      throw new ErrorHandler(401, 'User ID is required to create a topic');
    }

    const { subjectId, title, description, order, prerequisites, requiredQuizzesToUnlock, parentTopicId } = payload;

    const topicData = {
      subjectId,
      title,
      description: description || undefined,
      order: order !== undefined ? order : 0,
      prerequisites: prerequisites || [],
      requiredQuizzesToUnlock: requiredQuizzesToUnlock !== undefined ? requiredQuizzesToUnlock : 2,
      createdBy: userId,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };
    if (parentTopicId) {
      topicData.parentTopicId = parentTopicId;
    }

    return await TopicRepository.createTopic(topicData);
  }

  /**
   * Update topic
   * @param {string} topicId
   * @param {Object} payload
   */
  static async updateTopic(topicId, payload) {
    const updates = { ...payload };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const topic = await TopicRepository.updateTopic(topicId, updates);
    if (!topic) {
      throw new ErrorHandler(404, 'Topic not found');
    }
    return topic;
  }

  /**
   * Get topic by ID
   * @param {string} topicId
   */
  static async getTopicById(topicId) {
    const topic = await TopicRepository.getTopicById(topicId);
    if (!topic) {
      throw new ErrorHandler(404, 'Topic not found');
    }
    return topic;
  }

  /**
   * Get topics by subject ID
   * @param {string} subjectId
   * @param {Object} filter
   */
  static async getTopicsBySubjectId(subjectId, filter = {}) {
    return await TopicRepository.getTopicsBySubjectId(subjectId, filter);
  }

  /**
   * Get all topics
   * @param {Object} filter
   */
  static async getTopics(filter = {}) {
    return await TopicRepository.getAllTopics(filter);
  }

  /**
   * Delete topic
   * @param {string} topicId
   */
  static async deleteTopic(topicId) {
    const topic = await TopicRepository.getTopicById(topicId);
    if (!topic) {
      throw new ErrorHandler(404, 'Topic not found');
    }
    await TopicRepository.deleteTopic(topicId);
  }

  /**
   * Bulk update topic orders
   * @param {Array<{id: string, order: number}>} orders
   */
  static async bulkUpdateOrders(orders) {
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new ErrorHandler(400, 'Orders array is required and must not be empty');
    }
    await TopicRepository.bulkUpdateOrders(orders);
  }
}

module.exports = TopicService;

