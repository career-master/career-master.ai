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

    const { title, description, thumbnail, domain, category, level, requiresApproval, order, batches } = payload;

    const subjectData = {
      title,
      description: description || undefined,
      thumbnail: thumbnail || undefined,
      domain: domain || undefined,
      category: category || undefined,
      level: level || 'basic',
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
    
    // Process batches field - ensure it's an array
    if ('batches' in updates) {
      updates.batches = Array.isArray(updates.batches) 
        ? updates.batches.filter(Boolean) // Remove empty strings
        : [];
    }
    
    // Remove undefined values (but keep empty arrays for batches)
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
   * @param {Array<string>} userBatches - User's batch codes (optional, for filtering)
   * @param {Array<string>} userRoles - User's roles (optional, admins see all)
   * @param {Array<string>} userSelectedCourses - User's selected course categories (optional, for filtering)
   */
  static async getSubjectsPaginated(options = {}, userBatches = [], userRoles = [], userSelectedCourses = []) {
    const { page = 1, limit = 10, isActive, domain, category, level } = options;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    if (domain) {
      filter.domain = domain;
    }
    if (category) {
      filter.category = category;
    }
    if (level) {
      filter.level = level;
    }

    // Check if user is admin (admins see all subjects)
    const isAdmin = userRoles.some(role => 
      ['super_admin', 'technical_admin', 'content_admin', 'institution_admin'].includes(role)
    );

    // Build filter conditions
    const filterConditions = [];

    // If not admin, filter by batches
    if (!isAdmin) {
      if (userBatches && userBatches.length > 0) {
        filterConditions.push(
          { batches: { $exists: false } }, // No batches field
          { batches: { $size: 0 } }, // Empty batches array
          { batches: { $in: userBatches } }, // User is in one of the batches
          { requiresApproval: true } // Show approval-required subjects for requesting access
        );
      } else {
        filterConditions.push(
          { batches: { $exists: false } },
          { batches: { $size: 0 } },
          { requiresApproval: true }
        );
      }
    }

    // Filter by user's selected courses if they have selected any
    // If user has selected courses, show subjects that match those courses OR have no course categories
    if (userSelectedCourses && userSelectedCourses.length > 0) {
      const courseFilter = {
        $or: [
          { courseCategories: { $size: 0 } }, // Subjects with no course categories (available to all)
          { courseCategories: { $in: userSelectedCourses } } // Subjects matching user's selected courses
        ]
      };
      
      if (filterConditions.length > 0) {
        // Combine with batch filter
        filter.$and = [
          { $or: filterConditions },
          courseFilter
        ];
      } else {
        // Only course filter
        Object.assign(filter, courseFilter);
      }
    } else if (filterConditions.length > 0) {
      // Only batch filter, no course filter
      filter.$or = filterConditions;
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

