const express = require('express');
const AnnouncementsController = require('./announcements.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdParamSchema,
  listAnnouncementsPublicSchema,
  listAnnouncementsAdminSchema,
  validate
} = require('./announcements.validation');

const router = express.Router();

// Admin routes - require admin roles
const adminMiddleware = [authenticate, requireRole(['super_admin', 'content_admin', 'technical_admin'])];

// Public: list announcements for homepage (no auth)
router.get('/', validate(listAnnouncementsPublicSchema), AnnouncementsController.getPublicAnnouncements);

// Admin: list announcements with pagination
router.get(
  '/admin',
  adminMiddleware,
  validate(listAnnouncementsAdminSchema),
  AnnouncementsController.getAdminAnnouncements
);

// Admin: create announcement
router.post('/', adminMiddleware, validate(createAnnouncementSchema), AnnouncementsController.createAnnouncement);

// Admin: get announcement by ID
router.get(
  '/:id',
  adminMiddleware,
  validate(announcementIdParamSchema),
  AnnouncementsController.getAnnouncementById
);

// Admin: update announcement
router.put(
  '/:id',
  adminMiddleware,
  validate(updateAnnouncementSchema),
  AnnouncementsController.updateAnnouncement
);

// Admin: delete announcement
router.delete(
  '/:id',
  adminMiddleware,
  validate(announcementIdParamSchema),
  AnnouncementsController.deleteAnnouncement
);

module.exports = router;

