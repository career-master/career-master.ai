const Institution = require('./institutions.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class InstitutionsRepository {
  static async create(data) {
    try {
      const doc = new Institution(data);
      return await doc.save();
    } catch (error) {
      throw new ErrorHandler(500, `Error creating institution: ${error.message}`);
    }
  }

  static async updateById(id, updates) {
    try {
      const doc = await Institution.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      return doc;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating institution: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      await Institution.findByIdAndDelete(id);
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting institution: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await Institution.findById(id);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching institution: ${error.message}`);
    }
  }

  static async listPaginated({ page = 1, limit = 10, search = '' }) {
    try {
      const skip = (page - 1) * limit;
      const filter = {};
      if (search && search.trim()) {
        const q = search.trim();
        filter.$or = [
          { institutionName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          { city: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          { district: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        ];
      }
      const [items, total] = await Promise.all([
        Institution.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Institution.countDocuments(filter)
      ]);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return { items, total, page, limit, totalPages };
    } catch (error) {
      throw new ErrorHandler(500, `Error listing institutions: ${error.message}`);
    }
  }
}

module.exports = InstitutionsRepository;
