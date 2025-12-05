const EnrollmentService = require('./enrollments.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Enrollment Controller
 * HTTP handlers for enrollment endpoints
 */
class EnrollmentController {
  /**
   * POST /enrollments/request
   * Request enrollment (student)
   */
  static requestEnrollment = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const { subjectId } = req.body;

    const enrollment = await EnrollmentService.requestEnrollment(userId, subjectId);

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: enrollment
    });
  });

  /**
   * POST /enrollments/:id/approve
   * Approve enrollment (admin)
   */
  static approveEnrollment = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const enrollment = await EnrollmentService.approveEnrollment(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Enrollment approved successfully',
      data: enrollment
    });
  });

  /**
   * POST /enrollments/:id/reject
   * Reject enrollment (admin)
   */
  static rejectEnrollment = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const { rejectionReason } = req.body;

    const enrollment = await EnrollmentService.rejectEnrollment(req.params.id, userId, rejectionReason);

    res.status(200).json({
      success: true,
      message: 'Enrollment rejected',
      data: enrollment
    });
  });

  /**
   * GET /enrollments/:id
   * Get enrollment by ID
   */
  static getEnrollmentById = asyncHandler(async (req, res) => {
    const enrollment = await EnrollmentService.getEnrollmentById(req.params.id);

    res.status(200).json({
      success: true,
      data: enrollment
    });
  });

  /**
   * GET /enrollments/student/:studentId
   * Get student enrollments
   */
  static getStudentEnrollments = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId || req.user?.id || req.user?._id;
    const enrollments = await EnrollmentService.getStudentEnrollments(studentId);

    res.status(200).json({
      success: true,
      data: enrollments
    });
  });

  /**
   * GET /enrollments/subject/:subjectId
   * Get subject enrollments (admin)
   */
  static getSubjectEnrollments = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const enrollments = await EnrollmentService.getSubjectEnrollments(req.params.subjectId, filter);

    res.status(200).json({
      success: true,
      data: enrollments
    });
  });

  /**
   * GET /enrollments
   * Get all enrollments (admin)
   */
  static getAllEnrollments = asyncHandler(async (req, res) => {
    const { status, subjectId, studentId } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (studentId) {
      filter.studentId = studentId;
    }

    const enrollments = await EnrollmentService.getAllEnrollments(filter);

    res.status(200).json({
      success: true,
      data: enrollments
    });
  });
}

module.exports = EnrollmentController;

