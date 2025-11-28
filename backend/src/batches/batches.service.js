const BatchesRepository = require('./batches.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

class BatchesService {
  static async createBatch(payload) {
    const { name, code, description, startDate, endDate, isActive } = payload;
    const data = {
      name,
      code,
      description,
      isActive: isActive !== undefined ? isActive : true
    };
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    return BatchesRepository.createBatch(data);
  }

  static async updateBatch(id, payload) {
    const updates = { ...payload };
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    const batch = await BatchesRepository.updateBatch(id, updates);
    if (!batch) {
      throw new ErrorHandler(404, 'Batch not found');
    }
    return batch;
  }

  static async deleteBatch(id) {
    await BatchesRepository.deleteBatch(id);
  }

  static async getBatchById(id) {
    const batch = await BatchesRepository.getBatchById(id);
    if (!batch) {
      throw new ErrorHandler(404, 'Batch not found');
    }
    return batch;
  }

  static async getBatches({ page = 1, limit = 10 } = {}) {
    return BatchesRepository.getBatchesPaginated({ page, limit });
  }

  static async addStudentsToBatch(batchCode, userIds) {
    await BatchesRepository.addStudentsToBatch(batchCode, userIds);
  }

  static async removeStudentsFromBatch(batchCode, userIds) {
    await BatchesRepository.removeStudentsFromBatch(batchCode, userIds);
  }

  static async getStudentsPaginated(params) {
    return BatchesRepository.getStudentsPaginated(params);
  }
}

module.exports = BatchesService;


