const SubjectJoinRequest = require('./subject-requests.model');
const User = require('../user/users.model');
const Subject = require('./subjects.model');
const { ErrorHandler } = require('../middleware/errorHandler');
const emailUtil = require('../utils/email');
const env = require('../config/env');
const { getSettings } = require('../settings/settings.service');

/**
 * Subject Join Request Service
 * Handles business logic for subject join requests
 */
class SubjectJoinRequestService {
  /**
   * Calculate profile completion percentage.
   * Must match frontend getProfileCompletion (required + optional, 70/30 weight).
   */
  static calculateProfileCompletion(user) {
    if (!user) return 0;
    const profile = user.profile || {};
    const present = profile.presentAddress || {};
    const permanent = profile.permanentAddress || {};

    const isFilled = (val) => {
      if (typeof val === 'boolean') return val;
      if (Array.isArray(val)) return val.length > 0;
      return val != null && String(val).trim().length > 0;
    };

    // Required fields (70% weight) - same as profile form
    const requiredFields = [
      profile.firstName,
      profile.lastName,
      profile.dateOfBirth,
      profile.gender,
      profile.guardianName,
      profile.guardianRelation,
      user.phone,
      present.city,
      present.state,
      present.pinCode,
      present.country,
      profile.currentQualification,
      profile.institutionName
    ];

    // Optional fields (30% weight)
    const optionalFields = [
      user.profilePicture,
      user.email,
      profile.alternateMobile,
      profile.whatsappNumber,
      present.houseNo,
      present.street,
      present.area,
      present.district,
      permanent.city,
      permanent.state,
      permanent.pinCode,
      profile.university,
      profile.yearOfStudy,
      profile.expectedPassingYear,
      profile.percentage ?? profile.cgpa,
      (profile.selectedCourses?.length ?? 0) > 0
    ];

    const filledRequired = requiredFields.filter(isFilled).length;
    const filledOptional = optionalFields.filter(isFilled).length;
    const requiredScore = (filledRequired / requiredFields.length) * 70;
    const optionalScore = (filledOptional / optionalFields.length) * 30;
    return Math.round(requiredScore + optionalScore);
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

    // Check profile completion (toggle via admin settings; fallback to env)
    const settings = await getSettings();
    if (settings.profileCompletionEnforced) {
      const profileCompletion = this.calculateProfileCompletion(user);
      const minPercent = settings.profileMinCompletionPercent ?? env.PROFILE_MIN_COMPLETION_PERCENT;
      if (profileCompletion < minPercent) {
        throw new ErrorHandler(
          400,
          `Profile completion must be at least ${minPercent}%. Your profile is ${profileCompletion}% complete. Please complete your profile first.`
        );
      }
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

