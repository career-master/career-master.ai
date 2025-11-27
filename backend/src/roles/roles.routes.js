const express = require('express');
const RolesController = require('./roles.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  createRoleSchema,
  updateRoleSchema,
  modifyUserRoleSchema,
  validate
} = require('./roles.validation');

/**
 * Roles Routes
 * Base path: /api/roles
 */

const router = express.Router();

// All routes require authentication and super_admin role
const superAdminOnly = [authenticate, requireRole(['super_admin'])];

// Create role
router.post(
  '/',
  ...superAdminOnly,
  validate(createRoleSchema),
  RolesController.createRole
);

// Update role
router.put(
  '/:id',
  ...superAdminOnly,
  validate(updateRoleSchema),
  RolesController.updateRole
);

// List roles
router.get(
  '/',
  ...superAdminOnly,
  RolesController.getRoles
);

// Assign role to user
router.post(
  '/assign',
  ...superAdminOnly,
  validate(modifyUserRoleSchema),
  RolesController.assignRole
);

// Remove role from user
router.post(
  '/remove',
  ...superAdminOnly,
  validate(modifyUserRoleSchema),
  RolesController.removeRole
);

// List permissions
router.get(
  '/permissions',
  ...superAdminOnly,
  RolesController.getPermissions
);

module.exports = router;


