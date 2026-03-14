const CategoriesRepository = require('./categories.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

class CategoriesService {
  static async list(domain, activeOnly = false) {
    if (!domain || !String(domain).trim()) return [];
    return CategoriesRepository.findAll(String(domain).trim(), activeOnly);
  }

  static async create(payload) {
    const domain = (payload.domain || '').trim();
    const name = (payload.name || '').trim();
    if (!domain) throw new ErrorHandler(400, 'Domain is required');
    if (!name) throw new ErrorHandler(400, 'Category name is required');
    const existing = await CategoriesRepository.findByDomainAndName(domain, name);
    if (existing) throw new ErrorHandler(409, 'Category with this name already exists in this domain');
    return CategoriesRepository.create({
      domain,
      name,
      order: payload.order != null ? payload.order : 0,
      isActive: payload.isActive !== false,
    });
  }

  static async update(id, payload) {
    const updates = {};
    if (payload.name !== undefined) updates.name = String(payload.name).trim();
    if (payload.order !== undefined) updates.order = payload.order;
    if (payload.isActive !== undefined) updates.isActive = payload.isActive;
    if (Object.keys(updates).length === 0) return CategoriesRepository.findById(id);
    if (updates.name) {
      const existing = await CategoriesRepository.findById(id);
      if (existing) {
        const dup = await CategoriesRepository.findByDomainAndName(existing.domain, updates.name);
        if (dup && String(dup._id) !== String(id))
          throw new ErrorHandler(409, 'Category with this name already exists in this domain');
      }
    }
    return CategoriesRepository.update(id, updates);
  }

  static async delete(id) {
    return CategoriesRepository.delete(id);
  }
}

module.exports = CategoriesService;
