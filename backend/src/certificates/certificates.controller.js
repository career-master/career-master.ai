const CertificatesService = require('./certificates.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ErrorHandler } = require('../middleware/errorHandler');

function reqUserId(req) {
  return req.user?.userId || req.user?._id || req.user?.id;
}

function reqRoles(req) {
  return req.user?.roles || [];
}

function sendPdf(req, res, buffer, cert) {
  const base = `${cert.subjectTitle || 'certificate'}-${cert.certificateNumber || cert._id}`
    .replace(/[^\w.-]+/g, '-')
    .slice(0, 100);
  const disposition = req.query.download === '1' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Content-Disposition', `${disposition}; filename="${base}.pdf"`);
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.end(buffer);
}

class CertificatesController {
  static eligible = asyncHandler(async (req, res) => {
    const subjectId = req.query.subjectId;
    const result = await CertificatesService.getEligible(subjectId, req.query);
    res.status(200).json({ success: true, data: result });
  });

  static subjectProgress = asyncHandler(async (req, res) => {
    const subjectId = req.query.subjectId;
    const result = await CertificatesService.getSubjectProgress(subjectId, req.query);
    res.status(200).json({ success: true, data: result });
  });

  static generate = asyncHandler(async (req, res) => {
    const issuedById = reqUserId(req);
    const result = await CertificatesService.generate({
      ...req.body,
      issuedById
    });
    res.status(201).json({
      success: true,
      message: `Issued ${result.count} certificate(s).`,
      data: result
    });
  });

  static list = asyncHandler(async (req, res) => {
    const result = await CertificatesService.listAdmin(req.query);
    res.status(200).json({ success: true, data: result });
  });

  static my = asyncHandler(async (req, res) => {
    const userId = reqUserId(req);
    const items = await CertificatesService.listMine(userId);
    res.status(200).json({ success: true, data: { items } });
  });

  static getOne = asyncHandler(async (req, res) => {
    const cert = await CertificatesService.getById(req.params.id);
    const userId = reqUserId(req);
    const roles = reqRoles(req);
    const ownerId = cert.userId?._id ? String(cert.userId._id) : String(cert.userId);
    if (!roles.includes('super_admin') && ownerId !== String(userId)) {
      throw new ErrorHandler(403, 'Forbidden');
    }
    res.status(200).json({ success: true, data: cert });
  });

  static verify = asyncHandler(async (req, res) => {
    const data = await CertificatesService.verifyByNumber(req.params.certificateNumber);
    res.status(200).json({ success: true, data });
  });

  static verifyPdf = asyncHandler(async (req, res) => {
    const { cert, buffer } = await CertificatesService.getPdfByNumber(req.params.certificateNumber);
    sendPdf(req, res, buffer, cert);
  });

  static pdf = asyncHandler(async (req, res) => {
    const cert = await CertificatesService.getById(req.params.id);
    const ownerId = cert.userId?._id ? String(cert.userId._id) : String(cert.userId);
    if (!reqRoles(req).includes('super_admin') && ownerId !== String(reqUserId(req))) {
      throw new ErrorHandler(403, 'Forbidden');
    }
    const buffer = await CertificatesService.getPdfBuffer(cert);
    sendPdf(req, res, buffer, cert);
  });

  static update = asyncHandler(async (req, res) => {
    const updated = await CertificatesService.updateCertificate(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Certificate updated', data: updated });
  });

  static remove = asyncHandler(async (req, res) => {
    await CertificatesService.deleteCertificate(req.params.id);
    res.status(200).json({ success: true, message: 'Certificate deleted' });
  });
}

module.exports = CertificatesController;
