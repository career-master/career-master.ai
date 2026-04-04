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

  static async listPaginated({
    page = 1,
    limit = 10,
    search = '',
    institutionType,
    location = '',
    minStudentStrength,
    maxStudentStrength,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    try {
      const skip = (page - 1) * limit;
      const and = [];

      if (search && search.trim()) {
        const q = search.trim();
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        and.push({
          $or: [{ institutionName: rx }, { city: rx }, { district: rx }]
        });
      }

      const allowedTypes = Institution.INSTITUTION_TYPES || [];
      if (institutionType && allowedTypes.includes(institutionType)) {
        and.push({ institutionType });
      }

      if (location && String(location).trim()) {
        const rx = new RegExp(String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        and.push({
          $or: [{ city: rx }, { district: rx }, { state: rx }, { mandal: rx }]
        });
      }

      const minN = minStudentStrength != null && minStudentStrength !== '' ? Number(minStudentStrength) : null;
      const maxN = maxStudentStrength != null && maxStudentStrength !== '' ? Number(maxStudentStrength) : null;
      const strengthRange = {};
      if (minN != null && !Number.isNaN(minN)) strengthRange.$gte = minN;
      if (maxN != null && !Number.isNaN(maxN)) strengthRange.$lte = maxN;
      if (Object.keys(strengthRange).length) {
        and.push({ studentStrength: strengthRange });
      }

      const filter = and.length ? { $and: and } : {};

      const dir = sortOrder === 'asc' ? 1 : -1;
      const sort = {};
      if (sortBy === 'institutionName') sort.institutionName = dir;
      else if (sortBy === 'studentStrength') sort.studentStrength = dir;
      else sort.createdAt = dir;

      const [items, total] = await Promise.all([
        Institution.find(filter).sort(sort).skip(skip).limit(limit).lean(),
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
