const mongoose = require('mongoose');
const SubjectCertificate = require('./subject-certificates.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class CertificatesRepository {
  static async create(data) {
    try {
      const doc = new SubjectCertificate(data);
      return await doc.save();
    } catch (error) {
      throw new ErrorHandler(500, `Error saving certificate: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await SubjectCertificate.findById(id)
        .populate('userId', 'name email')
        .populate('subjectId', 'title')
        .populate('issuedBy', 'name email')
        .lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching certificate: ${error.message}`);
    }
  }

  static async listForAdmin({ page = 1, limit = 20, subjectId, search }) {
    try {
      const skip = (page - 1) * limit;
      const filter = {};
      if (subjectId && String(subjectId).trim() && mongoose.Types.ObjectId.isValid(subjectId)) {
        filter.subjectId = new mongoose.Types.ObjectId(subjectId);
      }
      const q = search && String(search).trim();
      if (q) {
        const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(safe, 'i');
        filter.$or = [{ recipientName: rx }, { userEmail: rx }];
      }
      const [items, total] = await Promise.all([
        SubjectCertificate.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email')
          .populate('subjectId', 'title')
          .populate('issuedBy', 'name email')
          .lean(),
        SubjectCertificate.countDocuments(filter)
      ]);
      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      };
    } catch (error) {
      throw new ErrorHandler(500, `Error listing certificates: ${error.message}`);
    }
  }

  static async listForUser(userId) {
    try {
      return await SubjectCertificate.find({ userId })
        .sort({ createdAt: -1 })
        .populate('subjectId', 'title')
        .lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error listing user certificates: ${error.message}`);
    }
  }

  static async updateById(id, updates) {
    try {
      return await SubjectCertificate.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      }).lean();
    } catch (error) {
      throw new ErrorHandler(500, `Error updating certificate: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      const doc = await SubjectCertificate.findByIdAndDelete(id).lean();
      return doc;
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting certificate: ${error.message}`);
    }
  }
}

module.exports = CertificatesRepository;
