const Batch = require('./batches.model');
const User = require('../user/users.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Batches Repository
 * Pure database operations for batches and batch-student relationships
 */
class BatchesRepository {
  static async createBatch(data) {
    try {
      const batch = new Batch(data);
      return await batch.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ErrorHandler(409, 'Batch code must be unique');
      }
      throw new ErrorHandler(500, `Error creating batch: ${error.message}`);
    }
  }

  static async updateBatch(id, updates) {
    try {
      // Separate fields to unset from fields to update
      const unsetFields = {};
      const updateFields = { ...updates };

      // If dates are explicitly set to null, unset them
      if (updates.startDate === null) {
        unsetFields.startDate = '';
        delete updateFields.startDate;
      }
      if (updates.endDate === null) {
        unsetFields.endDate = '';
        delete updateFields.endDate;
      }

      // Build update object
      const updateObj = { ...updateFields };
      if (Object.keys(unsetFields).length > 0) {
        updateObj.$unset = unsetFields;
      }

      const batch = await Batch.findByIdAndUpdate(id, updateObj, {
        new: true,
        runValidators: true
      });
      return batch;
    } catch (error) {
      throw new ErrorHandler(500, `Error updating batch: ${error.message}`);
    }
  }

  static async deleteBatch(id) {
    try {
      await Batch.findByIdAndDelete(id);
      // Optionally remove batch code from users
      await User.updateMany(
        { batches: id },
        { $pull: { batches: id } }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting batch: ${error.message}`);
    }
  }

  static async getBatchById(id) {
    try {
      return await Batch.findById(id);
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching batch: ${error.message}`);
    }
  }

  static async getBatchesPaginated({ page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Batch.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Batch.countDocuments()
      ]);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return { items, total, page, limit, totalPages };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching batches: ${error.message}`);
    }
  }

  static async addStudentsToBatch(batchCode, userIds = []) {
    try {
      if (!batchCode || !Array.isArray(userIds) || userIds.length === 0) return;
      await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { batches: batchCode } }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error adding students to batch: ${error.message}`);
    }
  }

  static async removeStudentsFromBatch(batchCode, userIds = []) {
    try {
      if (!batchCode || !Array.isArray(userIds) || userIds.length === 0) return;
      await User.updateMany(
        { _id: { $in: userIds } },
        { $pull: { batches: batchCode } }
      );
    } catch (error) {
      throw new ErrorHandler(500, `Error removing students from batch: ${error.message}`);
    }
  }

  static async getStudentsPaginated({ page = 1, limit = 10, search = '', batchCode }) {
    try {
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (batchCode) {
        filter.batches = batchCode;
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter)
      ]);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return { items, total, page, limit, totalPages };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching students: ${error.message}`);
    }
  }
}

module.exports = BatchesRepository;


