const Category = require('./categories.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class CategoriesRepository {
  static async findAll(domain, activeOnly = false) {
    const filter = { domain };
    if (activeOnly) filter.isActive = true;
    return Category.find(filter).sort({ order: 1, name: 1 }).lean();
  }

  static async findById(id) {
    return Category.findById(id);
  }

  static async findByDomainAndName(domain, name) {
    return Category.findOne({
      domain,
      name: { $regex: new RegExp(`^${String(name).trim()}$`, 'i') },
    });
  }

  static async create(data) {
    const doc = new Category(data);
    return doc.save();
  }

  static async update(id, updates) {
    const doc = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!doc) throw new ErrorHandler(404, 'Category not found');
    return doc;
  }

  static async delete(id) {
    const doc = await Category.findByIdAndDelete(id);
    if (!doc) throw new ErrorHandler(404, 'Category not found');
    return doc;
  }
}

module.exports = CategoriesRepository;
