const BatchJoinRequestService = require('./batch-requests.service');
const { asyncHandler } = require('../middleware/errorHandler');

class BatchJoinRequestController {
  static createRequest = asyncHandler(async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { batchCode, notes } = req.body;
    const request = await BatchJoinRequestService.createRequest(userId, batchCode, notes);
    res.status(201).json({ success: true, data: request });
  });

  static listRequests = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await BatchJoinRequestService.listRequests({
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });
    res.status(200).json({ success: true, data: result });
  });

  static approveRequest = asyncHandler(async (req, res) => {
    const reviewerId = req.user?.userId || req.user?.id || req.user?._id;
    const request = await BatchJoinRequestService.approveRequest(req.params.id, reviewerId);
    res.status(200).json({ success: true, message: 'Request approved', data: request });
  });

  static rejectRequest = asyncHandler(async (req, res) => {
    const reviewerId = req.user?.userId || req.user?.id || req.user?._id;
    const { notes } = req.body;
    const request = await BatchJoinRequestService.rejectRequest(req.params.id, reviewerId, notes);
    res.status(200).json({ success: true, message: 'Request rejected', data: request });
  });
}

module.exports = BatchJoinRequestController;

