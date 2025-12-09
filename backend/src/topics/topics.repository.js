const Topic = require('./topics.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Topic Repository
 * Pure database operations for topics
 */
class TopicRepository {
  /**
   * Create new topic
   * @param {Object} topicData
   * @returns {Promise<Object>}
   */
  static async createTopic(topicData) {
    try {
      const topic = new Topic(topicData);
      const savedTopic = await topic.save();
      return savedTopic;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Topic validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error creating topic: ${error.message}`);
    }
  }

  /**
   * Update topic
   * @param {string} topicId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateTopic(topicId, updates) {
    try {
      const topic = await Topic.findByIdAndUpdate(topicId, updates, {
        new: true,
        runValidators: true
      });
      return topic;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Topic validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating topic: ${error.message}`);
    }
  }

  /**
   * Get topic by ID
   * @param {string} topicId
   * @returns {Promise<Object|null>}
   */
  static async getTopicById(topicId) {
    try {
      return await Topic.findById(topicId);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching topic: ${error.message}`);
    }
  }

  /**
   * Get topics by subject ID
   * @param {string} subjectId
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getTopicsBySubjectId(subjectId, filter = {}) {
    try {
      return await Topic.find({ subjectId, ...filter }).sort({ order: 1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching topics: ${error.message}`);
    }
  }

  /**
   * Get all topics
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getAllTopics(filter = {}) {
    try {
      return await Topic.find(filter).sort({ order: 1, createdAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching topics: ${error.message}`);
    }
  }

  /**
   * Delete topic
   * @param {string} topicId
   * @returns {Promise<void>}
   */
  static async deleteTopic(topicId) {
    try {
      await Topic.findByIdAndDelete(topicId);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting topic: ${error.message}`);
    }
  }

  /**
   * Bulk update topic orders
   * @param {Array<{id: string, order: number}>} orders
   * @returns {Promise<void>}
   */
  static async bulkUpdateOrders(orders) {
    try {
      const bulkOps = orders.map(({ id, order }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order } }
        }
      }));
      await Topic.bulkWrite(bulkOps);
    } catch (error) {
      throw new ErrorHandler(500, `Error updating topic orders: ${error.message}`);
    }
  }
}

module.exports = TopicRepository;

