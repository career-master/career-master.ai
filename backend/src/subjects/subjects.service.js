const SubjectRepository = require('./subjects.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Subject Service
 * Business logic for subject management
 */
class SubjectService {
  /**
   * Create subject
   * @param {Object} payload
   * @param {string} userId
   */
  static async createSubject(payload, userId) {
    if (!userId) {
      throw new ErrorHandler(401, 'User ID is required to create a subject');
    }

    const { title, description, thumbnail, category, level, requiresApproval, order, batches } = payload;

    const subjectData = {
      title,
      description: description || undefined,
      thumbnail: thumbnail || undefined,
      category: category || undefined,
      level: level || 'beginner',
      batches: Array.isArray(batches) ? batches.filter(Boolean) : [],
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
      order: order || 0,
      createdBy: userId,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };

    return await SubjectRepository.createSubject(subjectData);
  }

  /**
   * Update subject
   * @param {string} subjectId
   * @param {Object} payload
   */
  static async updateSubject(subjectId, payload) {
    const updates = { ...payload };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const subject = await SubjectRepository.updateSubject(subjectId, updates);
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }
    return subject;
  }

  /**
   * Get subject by ID
   * @param {string} subjectId
   * @param {boolean} includeTopics
   */
  static async getSubjectById(subjectId, includeTopics = false) {
    const subject = await SubjectRepository.getSubjectById(subjectId, includeTopics);
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }
    return subject;
  }

  /**
   * Get all subjects
   * @param {Object} filter
   */
  static async getSubjects(filter = {}) {
    return await SubjectRepository.getAllSubjects(filter);
  }

  /**
   * Get subjects with pagination
   * @param {Object} options
   */
  static async getSubjectsPaginated(options = {}) {
    const { page = 1, limit = 10, isActive, category, level } = options;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    if (category) {
      filter.category = category;
    }
    if (level) {
      filter.level = level;
    }

    return await SubjectRepository.getSubjectsPaginated({ filter, page, limit });
  }

  /**
   * Delete subject
   * @param {string} subjectId
   */
  static async deleteSubject(subjectId) {
    const subject = await SubjectRepository.getSubjectById(subjectId);
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }
    await SubjectRepository.deleteSubject(subjectId);
  }

  /**
   * Bulk update subject orders
   * @param {Array<{id: string, order: number}>} orders
   */
  static async bulkUpdateOrders(orders) {
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new ErrorHandler(400, 'Orders array is required and must not be empty');
    }
    await SubjectRepository.bulkUpdateOrders(orders);
  }
}

module.exports = SubjectService;

