const AnnouncementsRepository = require('./announcements.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Announcements Service
 * Business logic for announcements (updates, trainings, exams)
 */
class AnnouncementsService {
  /**
   * Create announcement
   * @param {Object} payload
   * @param {string} userId
   */
  static async createAnnouncement(payload, userId) {
    if (!userId) {
      throw new ErrorHandler(401, 'User ID is required to create an announcement');
    }

    const data = this.buildAnnouncementData(payload, userId, true);
    return AnnouncementsRepository.createAnnouncement(data);
  }

  /**
   * Update announcement
   * @param {string} id
   * @param {Object} payload
   * @param {string} userId
   */
  static async updateAnnouncement(id, payload, userId) {
    if (!id) {
      throw new ErrorHandler(400, 'Announcement ID is required');
    }

    const updates = this.buildAnnouncementData(payload, userId, false);
    const doc = await AnnouncementsRepository.updateAnnouncement(id, updates);
    if (!doc) {
      throw new ErrorHandler(404, 'Announcement not found');
    }
    return doc;
  }

  /**
   * Delete announcement
   * @param {string} id
   */
  static async deleteAnnouncement(id) {
    const existing = await AnnouncementsRepository.getAnnouncementById(id);
    if (!existing) {
      throw new ErrorHandler(404, 'Announcement not found');
    }
    await AnnouncementsRepository.deleteAnnouncement(id);
  }

  /**
   * Get announcement by ID
   * @param {string} id
   */
  static async getAnnouncementById(id) {
    const doc = await AnnouncementsRepository.getAnnouncementById(id);
    if (!doc) {
      throw new ErrorHandler(404, 'Announcement not found');
    }
    return doc;
  }

  /**
   * Get announcements for public homepage
   * @param {Object} options
   * @param {string} [options.type]
   * @param {number} [options.limit]
   */
  static async getPublicAnnouncements({ type, limit } = {}) {
    const filter = { isActive: true };
    if (type) {
      filter.type = type;
    }
    const finalLimit = typeof limit === 'number' && limit > 0 ? limit : 10;
    return AnnouncementsRepository.getPublicAnnouncements(filter, finalLimit);
  }

  /**
   * Get announcements for admin with pagination
   * @param {Object} options
   * @param {string} [options.type]
   * @param {string|boolean} [options.isActive]
   * @param {number} [options.page]
   * @param {number} [options.limit]
   */
  static async getAdminAnnouncements({ type, isActive, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (type) {
      filter.type = type;
    }
    if (isActive !== undefined) {
      if (typeof isActive === 'string') {
        filter.isActive = isActive === 'true';
      } else {
        filter.isActive = !!isActive;
      }
    }

    const pageNum = Number.isFinite(page) ? page : 1;
    const limitNum = Number.isFinite(limit) ? limit : 10;

    return AnnouncementsRepository.getAdminAnnouncements({
      filter,
      page: pageNum,
      limit: limitNum
    });
  }

  /**
   * Helper to build announcement data from payload
   * @param {Object} payload
   * @param {string} userId
   * @param {boolean} isCreate
   * @returns {Object}
   */
  static buildAnnouncementData(payload, userId, isCreate) {
    const {
      title,
      description,
      type,
      dateText,
      startDate,
      endDate,
      status,
      linkUrl,
      linkLabel,
      isActive,
      order
    } = payload || {};

    const data = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (dateText !== undefined) data.dateText = dateText;
    if (status !== undefined) data.status = status;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;
    if (linkLabel !== undefined) data.linkLabel = linkLabel;
    if (isActive !== undefined) data.isActive = isActive;
    if (order !== undefined) data.order = order;

    if (startDate !== undefined) {
      data.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      data.endDate = endDate ? new Date(endDate) : null;
    }

    if (isCreate) {
      data.createdBy = userId;
    }
    if (userId) {
      data.updatedBy = userId;
    }

    // Remove undefined keys to avoid accidental overwrites
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }
}

module.exports = AnnouncementsService;

