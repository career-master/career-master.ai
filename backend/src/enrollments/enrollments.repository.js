const Enrollment = require('./enrollments.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Enrollment Repository
 * Pure database operations for enrollments
 */
class EnrollmentRepository {
  /**
   * Create enrollment request
   * @param {Object} enrollmentData
   * @returns {Promise<Object>}
   */
  static async createEnrollment(enrollmentData) {
    try {
      const enrollment = new Enrollment(enrollmentData);
      const savedEnrollment = await enrollment.save();
      return savedEnrollment;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Enrollment validation failed: ${validationErrors}`);
      }
      if (error.code === 11000) {
        throw new ErrorHandler(400, 'Enrollment request already exists for this student and subject');
      }
      throw new ErrorHandler(500, `Error creating enrollment: ${error.message}`);
    }
  }

  /**
   * Update enrollment
   * @param {string} enrollmentId
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateEnrollment(enrollmentId, updates) {
    try {
      const enrollment = await Enrollment.findByIdAndUpdate(enrollmentId, updates, {
        new: true,
        runValidators: true
      });
      return enrollment;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
        throw new ErrorHandler(400, `Enrollment validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating enrollment: ${error.message}`);
    }
  }

  /**
   * Get enrollment by ID
   * @param {string} enrollmentId
   * @returns {Promise<Object|null>}
   */
  static async getEnrollmentById(enrollmentId) {
    try {
      return await Enrollment.findById(enrollmentId)
        .populate('studentId', 'name email')
        .populate('subjectId', 'title description')
        .populate('approvedBy', 'name email');
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching enrollment: ${error.message}`);
    }
  }

  /**
   * Get enrollment by student and subject
   * @param {string} studentId
   * @param {string} subjectId
   * @returns {Promise<Object|null>}
   */
  static async getEnrollment(studentId, subjectId) {
    try {
      return await Enrollment.findOne({ studentId, subjectId })
        .populate('subjectId', 'title description');
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching enrollment: ${error.message}`);
    }
  }

  /**
   * Get enrollments by student
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  static async getStudentEnrollments(studentId) {
    try {
      return await Enrollment.find({ studentId })
        .populate('subjectId', 'title description thumbnail')
        .sort({ requestedAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching enrollments: ${error.message}`);
    }
  }

  /**
   * Get enrollments by subject
   * @param {string} subjectId
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getSubjectEnrollments(subjectId, filter = {}) {
    try {
      return await Enrollment.find({ subjectId, ...filter })
        .populate('studentId', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ requestedAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching enrollments: ${error.message}`);
    }
  }

  /**
   * Get all enrollments (admin)
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  static async getAllEnrollments(filter = {}) {
    try {
      return await Enrollment.find(filter)
        .populate('studentId', 'name email')
        .populate('subjectId', 'title description')
        .populate('approvedBy', 'name email')
        .sort({ requestedAt: -1 });
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching enrollments: ${error.message}`);
    }
  }
}

module.exports = EnrollmentRepository;

