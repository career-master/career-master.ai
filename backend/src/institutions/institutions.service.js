const InstitutionsRepository = require('./institutions.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

const pickDefined = (obj) => {
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
};

class InstitutionsService {
  static async create(payload) {
    const data = pickDefined({
      institutionName: payload.institutionName,
      institutionType: payload.institutionType,
      yearEstablished: payload.yearEstablished,
      affiliationBoard: payload.affiliationBoard,
      studentStrength: payload.studentStrength,
      logoUrl: payload.logoUrl,
      chairmanName: payload.chairmanName,
      principalName: payload.principalName,
      adminName: payload.adminName,
      adminEmail: payload.adminEmail,
      adminMobile: payload.adminMobile,
      officialEmail: payload.officialEmail,
      contactMobile1: payload.contactMobile1,
      contactMobile2: payload.contactMobile2,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2,
      city: payload.city,
      mandal: payload.mandal,
      district: payload.district,
      state: payload.state,
      pinCode: payload.pinCode,
      googleMapLocation: payload.googleMapLocation
    });
    return InstitutionsRepository.create(data);
  }

  static async update(id, payload) {
    const updates = pickDefined({
      institutionName: payload.institutionName,
      institutionType: payload.institutionType,
      yearEstablished: payload.yearEstablished,
      affiliationBoard: payload.affiliationBoard,
      studentStrength: payload.studentStrength,
      logoUrl: payload.logoUrl,
      chairmanName: payload.chairmanName,
      principalName: payload.principalName,
      adminName: payload.adminName,
      adminEmail: payload.adminEmail,
      adminMobile: payload.adminMobile,
      officialEmail: payload.officialEmail,
      contactMobile1: payload.contactMobile1,
      contactMobile2: payload.contactMobile2,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2,
      city: payload.city,
      mandal: payload.mandal,
      district: payload.district,
      state: payload.state,
      pinCode: payload.pinCode,
      googleMapLocation: payload.googleMapLocation
    });
    const doc = await InstitutionsRepository.updateById(id, updates);
    if (!doc) {
      throw new ErrorHandler(404, 'Institution not found');
    }
    return doc;
  }

  static async delete(id) {
    const existing = await InstitutionsRepository.findById(id);
    if (!existing) {
      throw new ErrorHandler(404, 'Institution not found');
    }
    await InstitutionsRepository.deleteById(id);
  }

  static async getById(id) {
    const doc = await InstitutionsRepository.findById(id);
    if (!doc) {
      throw new ErrorHandler(404, 'Institution not found');
    }
    return doc;
  }

  static async list({ page = 1, limit = 10, search = '' } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    return InstitutionsRepository.listPaginated({
      page: safePage,
      limit: safeLimit,
      search: typeof search === 'string' ? search : ''
    });
  }
}

module.exports = InstitutionsService;
