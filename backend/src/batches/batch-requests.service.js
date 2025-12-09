const BatchJoinRequest = require('./batch-requests.model');
const User = require('../user/users.model');
const Batch = require('./batches.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class BatchJoinRequestService {
  static async createRequest(userId, batchCode, notes) {
    if (!userId || !batchCode) {
      throw new ErrorHandler(400, 'User and batch code are required');
    }

    const batch = await Batch.findOne({ code: batchCode });
    if (!batch) {
      throw new ErrorHandler(404, 'Batch not found');
    }

    // Prevent duplicates pending
    const existingPending = await BatchJoinRequest.findOne({ userId, batchCode, status: 'pending' });
    if (existingPending) {
      throw new ErrorHandler(409, 'You already have a pending request for this batch');
    }

    // If already in batch, skip
    const user = await User.findById(userId);
    if (!user) throw new ErrorHandler(404, 'User not found');
    if (user.batches?.includes(batchCode)) {
      throw new ErrorHandler(409, 'You are already in this batch');
    }

    return await BatchJoinRequest.create({ userId, batchCode, notes });
  }

  static async listRequests({ status, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      BatchJoinRequest.find(filter)
        .populate('userId', 'name email phone batches')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BatchJoinRequest.countDocuments(filter)
    ]);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  static async approveRequest(requestId, reviewerId) {
    const req = await BatchJoinRequest.findById(requestId);
    if (!req) throw new ErrorHandler(404, 'Request not found');
    if (req.status !== 'pending') throw new ErrorHandler(400, 'Request already processed');

    // Add batch to user
    await User.updateOne(
      { _id: req.userId },
      { $addToSet: { batches: req.batchCode } }
    );

    req.status = 'approved';
    req.reviewedBy = reviewerId;
    req.reviewedAt = new Date();
    await req.save();
    return req;
  }

  static async rejectRequest(requestId, reviewerId, notes) {
    const req = await BatchJoinRequest.findById(requestId);
    if (!req) throw new ErrorHandler(404, 'Request not found');
    if (req.status !== 'pending') throw new ErrorHandler(400, 'Request already processed');

    req.status = 'rejected';
    req.notes = notes || req.notes;
    req.reviewedBy = reviewerId;
    req.reviewedAt = new Date();
    await req.save();
    return req;
  }
}

module.exports = BatchJoinRequestService;

