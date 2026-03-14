const CategoriesService = require('./categories.service');
const { asyncHandler } = require('../middleware/errorHandler');

class CategoriesController {
  static list = asyncHandler(async (req, res) => {
    const domain = req.query.domain;
    const activeOnly = req.query.active === 'true' || req.query.active === true;
    const list = await CategoriesService.list(domain, activeOnly);
    res.status(200).json({ success: true, data: list });
  });

  static create = asyncHandler(async (req, res) => {
    const category = await CategoriesService.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  });

  static update = asyncHandler(async (req, res) => {
    const category = await CategoriesService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Category updated', data: category });
  });

  static delete = asyncHandler(async (req, res) => {
    await CategoriesService.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  });
}

module.exports = CategoriesController;
