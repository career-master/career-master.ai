const BatchesService = require('./batches.service');
const { asyncHandler } = require('../middleware/errorHandler');

class BatchesController {
  static createBatch = asyncHandler(async (req, res) => {
    const batch = await BatchesService.createBatch(req.body);
    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  });

  static updateBatch = asyncHandler(async (req, res) => {
    const batch = await BatchesService.updateBatch(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  });

  static deleteBatch = asyncHandler(async (req, res) => {
    await BatchesService.deleteBatch(req.params.id);
    res.status(204).send();
  });

  static getBatchById = asyncHandler(async (req, res) => {
    const batch = await BatchesService.getBatchById(req.params.id);
    res.status(200).json({
      success: true,
      data: batch
    });
  });

  static getBatches = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await BatchesService.getBatches({ page, limit });
    res.status(200).json({
      success: true,
      data: result
    });
  });

  static addStudentsToBatch = asyncHandler(async (req, res) => {
    const batchCode = req.params.code;
    const { userIds } = req.body;
    await BatchesService.addStudentsToBatch(batchCode, userIds);
    res.status(200).json({
      success: true,
      message: 'Students added to batch successfully'
    });
  });

  static removeStudentsFromBatch = asyncHandler(async (req, res) => {
    const batchCode = req.params.code;
    const { userIds } = req.body;
    await BatchesService.removeStudentsFromBatch(batchCode, userIds);
    res.status(200).json({
      success: true,
      message: 'Students removed from batch successfully'
    });
  });

  static getPaginatedStudents = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const batchCode = req.query.batchCode;

    const result = await BatchesService.getStudentsPaginated({
      page,
      limit,
      search,
      batchCode
    });

    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = BatchesController;


