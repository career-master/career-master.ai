const InstitutionsService = require('./institutions.service');
const { asyncHandler } = require('../middleware/errorHandler');

class InstitutionsController {
  static create = asyncHandler(async (req, res) => {
    const doc = await InstitutionsService.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      data: doc
    });
  });

  static update = asyncHandler(async (req, res) => {
    const doc = await InstitutionsService.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Institution updated successfully',
      data: doc
    });
  });

  static delete = asyncHandler(async (req, res) => {
    await InstitutionsService.delete(req.params.id);
    res.status(204).send();
  });

  static getById = asyncHandler(async (req, res) => {
    const doc = await InstitutionsService.getById(req.params.id);
    res.status(200).json({
      success: true,
      data: doc
    });
  });

  static list = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const institutionType = req.query.institutionType || '';
    const location = req.query.location || '';
    const minStudentStrength = req.query.minStudentStrength;
    const maxStudentStrength = req.query.maxStudentStrength;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const result = await InstitutionsService.list({
      page,
      limit,
      search,
      institutionType,
      location,
      minStudentStrength,
      maxStudentStrength,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = InstitutionsController;
