const SubjectJoinRequest = require('./subject-requests.model');
const User = require('../user/users.model');
const Subject = require('./subjects.model');
const { ErrorHandler } = require('../middleware/errorHandler');
const emailUtil = require('../utils/email');

/**
 * Subject Join Request Service
 * Handles business logic for subject join requests
 */
class SubjectJoinRequestService {
  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(user) {
    const fields = [
      user.name,
      user.phone,
      user.profile?.currentStatus,
      user.profile?.college,
      user.profile?.school,
      user.profile?.jobTitle,
      user.profile?.interests?.length > 0,
      user.profile?.learningGoals,
      user.profile?.city,
      user.profile?.country,
      user.profilePicture
    ];
    const filledFields = fields.filter(field => {
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  /**
   * Create subject join request
   */
  static async createRequest(userId, subjectId, email, phone) {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler(404, 'User not found');
    }

    // Check profile completion
    const profileCompletion = this.calculateProfileCompletion(user);
    if (profileCompletion < 70) {
      throw new ErrorHandler(400, `Profile completion must be at least 70%. Your profile is ${profileCompletion}% complete. Please complete your profile first.`);
    }

    // Check if subject exists and requires approval
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }

    if (!subject.requiresApproval) {
      throw new ErrorHandler(400, 'This subject does not require approval');
    }

    // Check if user already has access (is in one of the subject's batches)
    const userBatches = user.batches || [];
    if (subject.batches && subject.batches.length > 0) {
      const hasAccess = subject.batches.some(batch => userBatches.includes(batch));
      if (hasAccess) {
        throw new ErrorHandler(400, 'You already have access to this subject');
      }
    } else {
      // Subject has no batches, so it's available to all
      throw new ErrorHandler(400, 'This subject is available to all students');
    }

    // Check if there's already a pending request
    const existingRequest = await SubjectJoinRequest.findOne({
      userId,
      subjectId,
      status: 'pending'
    });

    if (existingRequest) {
      throw new ErrorHandler(400, 'You already have a pending request for this subject');
    }

    // Create request
    const request = new SubjectJoinRequest({
      userId,
      subjectId,
      email: email || user.email,
      phone: phone || user.phone || '',
      status: 'pending'
    });

    await request.save();
    return request;
  }

  /**
   * List requests (for admins)
   */
  static async listRequests({ status, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SubjectJoinRequest.find(filter)
        .populate('userId', 'name email')
        .populate('subjectId', 'title')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SubjectJoinRequest.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  /**
   * Approve request
   */
  static async approveRequest(requestId, reviewerId) {
    const req = await SubjectJoinRequest.findById(requestId).populate('subjectId');
    if (!req) {
      throw new ErrorHandler(404, 'Request not found');
    }
    if (req.status !== 'pending') {
      throw new ErrorHandler(400, 'Request already processed');
    }

    const subject = req.subjectId;
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }

    // Add user to subject's batches
    const user = await User.findById(req.userId);
    if (user) {
      if (subject.batches && subject.batches.length > 0) {
        // Add all subject batches to user
        const updatedBatches = [...new Set([...(user.batches || []), ...subject.batches])];
        await User.updateOne(
          { _id: req.userId },
          { $set: { batches: updatedBatches } }
        );
      }

      // Send approval email
      try {
        await emailUtil.sendSubjectAccessApprovalEmail(
          user.email,
          user.name || 'Student',
          subject.title
        );
      } catch (emailError) {
        // Log error but don't fail the approval
        console.error('Failed to send approval email:', emailError);
      }
    }

    req.status = 'approved';
    req.reviewedBy = reviewerId;
    req.reviewedAt = new Date();
    await req.save();
    return req;
  }

  /**
   * Reject request
   */
  static async rejectRequest(requestId, reviewerId, notes) {
    const req = await SubjectJoinRequest.findById(requestId);
    if (!req) {
      throw new ErrorHandler(404, 'Request not found');
    }
    if (req.status !== 'pending') {
      throw new ErrorHandler(400, 'Request already processed');
    }

    req.status = 'rejected';
    req.notes = notes || req.notes;
    req.reviewedBy = reviewerId;
    req.reviewedAt = new Date();
    await req.save();
    return req;
  }
}

module.exports = SubjectJoinRequestService;

