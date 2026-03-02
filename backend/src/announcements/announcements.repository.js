const Announcement = require('./announcements.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Announcement Repository
 * Pure database operations for announcements
 */
class AnnouncementsRepository {
  /**
   * Create new announcement
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async createAnnouncement(data) {
    try {
      const doc = new Announcement(data);
      return await doc.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors)
          .map((e) => e.message)
          .join(', ');
        throw new ErrorHandler(400, `Announcement validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error creating announcement: ${error.message}`);
    }
  }

  /**
   * Update announcement
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  static async updateAnnouncement(id, updates) {
    try {
      return await Announcement.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors)
          .map((e) => e.message)
          .join(', ');
        throw new ErrorHandler(400, `Announcement validation failed: ${validationErrors}`);
      }
      throw new ErrorHandler(500, `Error updating announcement: ${error.message}`);
    }
  }

  /**
   * Delete announcement
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async deleteAnnouncement(id) {
    try {
      await Announcement.findByIdAndDelete(id);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting announcement: ${error.message}`);
    }
  }

  /**
   * Get announcement by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async getAnnouncementById(id) {
    try {
      return await Announcement.findById(id);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching announcement: ${error.message}`);
    }
  }

  /**
   * Get announcements for public homepage
   * @param {Object} filter
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getPublicAnnouncements(filter = {}, limit = 10) {
    try {
      return await Announcement.find(filter)
        .sort({ order: 1, startDate: -1, createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching announcements: ${error.message}`);
    }
  }

  /**
   * Get announcements for admin with pagination
   * @param {Object} options
   * @param {Object} options.filter
   * @param {number} options.page
   * @param {number} options.limit
   */
  static async getAdminAnnouncements({ filter = {}, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Announcement.find(filter)
          .sort({ type: 1, order: 1, startDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Announcement.countDocuments(filter)
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        items,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching announcements: ${error.message}`);
    }
  }
}

module.exports = AnnouncementsRepository;

