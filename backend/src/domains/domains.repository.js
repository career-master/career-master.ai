const Domain = require('./domains.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class DomainsRepository {
  static async findAll(activeOnly = false) {
    const filter = activeOnly ? { isActive: true } : {};
    return Domain.find(filter).sort({ order: 1, name: 1 }).lean();
  }

  static async findById(id) {
    return Domain.findById(id);
  }

  static async findByName(name) {
    return Domain.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  }

  static async create(data) {
    const doc = new Domain(data);
    return doc.save();
  }

  static async update(id, updates) {
    const doc = await Domain.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!doc) throw new ErrorHandler(404, 'Domain not found');
    return doc;
  }

  static async delete(id) {
    const doc = await Domain.findByIdAndDelete(id);
    if (!doc) throw new ErrorHandler(404, 'Domain not found');
    return doc;
  }
}

module.exports = DomainsRepository;
