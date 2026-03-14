const DomainsRepository = require('./domains.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

class DomainsService {
  static async list(activeOnly = false) {
    return DomainsRepository.findAll(activeOnly);
  }

  static async create(payload) {
    const name = (payload.name || '').trim();
    if (!name) throw new ErrorHandler(400, 'Domain name is required');
    const existing = await DomainsRepository.findByName(name);
    if (existing) throw new ErrorHandler(409, 'Domain with this name already exists');
    return DomainsRepository.create({
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
    if (Object.keys(updates).length === 0) return DomainsRepository.findById(id);
    if (updates.name) {
      const existing = await DomainsRepository.findByName(updates.name);
      if (existing && String(existing._id) !== String(id))
        throw new ErrorHandler(409, 'Domain with this name already exists');
    }
    return DomainsRepository.update(id, updates);
  }

  static async delete(id) {
    return DomainsRepository.delete(id);
  }
}

module.exports = DomainsService;
