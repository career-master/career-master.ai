const SubjectJoinRequestService = require('./subject-requests.service');
const { asyncHandler } = require('../middleware/errorHandler');

class SubjectJoinRequestController {
  static createRequest = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { subjectId, email, phone } = req.body;
    const request = await SubjectJoinRequestService.createRequest(userId, subjectId, email, phone);
    res.status(201).json({ success: true, message: 'Request submitted successfully', data: request });
  });

  static listRequests = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;

    // Sanitize query params
    const allowedStatus = ['pending', 'approved', 'rejected'];
    const safeStatus = allowedStatus.includes(status) ? status : undefined;
    const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 20;

    const result = await SubjectJoinRequestService.listRequests({
      status: safeStatus,
      page: safePage,
      limit: safeLimit
    });
    res.status(200).json({ success: true, data: result });
  });

  static approveRequest = asyncHandler(async (req, res) => {
    const reviewerId = req.user?.userId || req.user?.id || req.user?._id;
    const request = await SubjectJoinRequestService.approveRequest(req.params.id, reviewerId);
    res.status(200).json({ success: true, message: 'Request approved', data: request });
  });

  static rejectRequest = asyncHandler(async (req, res) => {
    const reviewerId = req.user?.userId || req.user?.id || req.user?._id;
    const { notes } = req.body;
    const request = await SubjectJoinRequestService.rejectRequest(req.params.id, reviewerId, notes);
    res.status(200).json({ success: true, message: 'Request rejected', data: request });
  });
}

module.exports = SubjectJoinRequestController;

