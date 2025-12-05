const EnrollmentRepository = require('./enrollments.repository');
const Subject = require('../subjects/subjects.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Enrollment Service
 * Business logic for enrollment management
 */
class EnrollmentService {
  /**
   * Request enrollment (student)
   * @param {string} studentId
   * @param {string} subjectId
   */
  static async requestEnrollment(studentId, subjectId) {
    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }

    // Check if enrollment already exists
    const existing = await EnrollmentRepository.getEnrollment(studentId, subjectId);
    if (existing) {
      throw new ErrorHandler(400, 'Enrollment request already exists');
    }

    const enrollmentData = {
      studentId,
      subjectId,
      status: 'pending'
    };

    return await EnrollmentRepository.createEnrollment(enrollmentData);
  }

  /**
   * Approve enrollment (admin)
   * @param {string} enrollmentId
   * @param {string} approvedBy
   */
  static async approveEnrollment(enrollmentId, approvedBy) {
    const enrollment = await EnrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new ErrorHandler(404, 'Enrollment not found');
    }

    if (enrollment.status === 'approved') {
      throw new ErrorHandler(400, 'Enrollment is already approved');
    }

    const updates = {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy
    };

    return await EnrollmentRepository.updateEnrollment(enrollmentId, updates);
  }

  /**
   * Reject enrollment (admin)
   * @param {string} enrollmentId
   * @param {string} rejectedBy
   * @param {string} rejectionReason
   */
  static async rejectEnrollment(enrollmentId, rejectedBy, rejectionReason) {
    const enrollment = await EnrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new ErrorHandler(404, 'Enrollment not found');
    }

    const updates = {
      status: 'rejected',
      approvedBy: rejectedBy,
      rejectionReason: rejectionReason || 'No reason provided'
    };

    return await EnrollmentRepository.updateEnrollment(enrollmentId, updates);
  }

  /**
   * Get enrollment by ID
   * @param {string} enrollmentId
   */
  static async getEnrollmentById(enrollmentId) {
    const enrollment = await EnrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new ErrorHandler(404, 'Enrollment not found');
    }
    return enrollment;
  }

  /**
   * Get enrollment for student and subject
   * @param {string} studentId
   * @param {string} subjectId
   */
  static async getEnrollment(studentId, subjectId) {
    return await EnrollmentRepository.getEnrollment(studentId, subjectId);
  }

  /**
   * Get student enrollments
   * @param {string} studentId
   */
  static async getStudentEnrollments(studentId) {
    return await EnrollmentRepository.getStudentEnrollments(studentId);
  }

  /**
   * Get subject enrollments (admin)
   * @param {string} subjectId
   * @param {Object} filter
   */
  static async getSubjectEnrollments(subjectId, filter = {}) {
    return await EnrollmentRepository.getSubjectEnrollments(subjectId, filter);
  }

  /**
   * Get all enrollments (admin)
   * @param {Object} filter
   */
  static async getAllEnrollments(filter = {}) {
    return await EnrollmentRepository.getAllEnrollments(filter);
  }
}

module.exports = EnrollmentService;

