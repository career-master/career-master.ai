const Subject = require('./subjects.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Subject Repository
 * Pure database operations for subjects
 */
class SubjectRepository {
  /**
   * Create new subject
   * @param {Object} subjectData
   * @returns {Promise<Object>}
   */
  static async createSubject(subjectData) {
    try {
      const subject = new Subject(subjectData);
      const savedSubject = await subject.save();
      return savedSubject;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Subject validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error creating subject: ${error.message}`);
    }
  }

  /**
   * Update subject
   * @param {string} subjectId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateSubject(subjectId, updates) {
    try {
      const subject = await Subject.findByIdAndUpdate(subjectId, updates, {
        new: true,
        runValidators: true
      });
      return subject;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Subject validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating subject: ${error.message}`);
    }
  }

  /**
   * Get subject by ID
   * @param {string} subjectId
   * @param {boolean} populateTopics
   * @returns {Promise<Object|null>}
   */
  static async getSubjectById(subjectId, populateTopics = false) {
    try {
      const query = Subject.findById(subjectId);
      if (populateTopics) {
        query.populate({
          path: 'topics',
          select: 'title description order isActive requiredQuizzesToUnlock',
          options: { sort: { order: 1 } }
        });
      }
      return await query;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching subject: ${error.message}`);
    }
  }

  /**
   * Get all subjects
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getAllSubjects(filter = {}) {
    try {
      return await Subject.find(filter).sort({ order: 1, createdAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching subjects: ${error.message}`);
    }
  }

  /**
   * Get subjects with pagination
   * @param {Object} options
   * @param {Object} options.filter
   * @param {number} options.page
   * @param {number} options.limit
   */
  static async getSubjectsPaginated({ filter = {}, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Subject.find(filter)
          .sort({ order: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Subject.countDocuments(filter)
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        items,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching subjects: ${error.message}`);
    }
  }

  /**
   * Delete subject
   * @param {string} subjectId
   * @returns {Promise<void>}
   */
  static async deleteSubject(subjectId) {
    try {
      await Subject.findByIdAndDelete(subjectId);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting subject: ${error.message}`);
    }
  }
}

module.exports = SubjectRepository;

