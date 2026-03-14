const DomainsService = require('./domains.service');
const { asyncHandler } = require('../middleware/errorHandler');

class DomainsController {
  static list = asyncHandler(async (req, res) => {
    const activeOnly = req.query.active === 'true' || req.query.active === true;
    const list = await DomainsService.list(activeOnly);
    res.status(200).json({ success: true, data: list });
  });

  static create = asyncHandler(async (req, res) => {
    const domain = await DomainsService.create(req.body);
    res.status(201).json({ success: true, message: 'Domain created', data: domain });
  });

  static update = asyncHandler(async (req, res) => {
    const domain = await DomainsService.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Domain updated', data: domain });
  });

  static delete = asyncHandler(async (req, res) => {
    await DomainsService.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Domain deleted' });
  });
}

module.exports = DomainsController;
