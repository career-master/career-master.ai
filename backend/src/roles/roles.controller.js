const RolesService = require('./roles.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Roles Controller
 * HTTP request/response handlers (no business logic)
 */
class RolesController {
  /**
   * POST /roles
   * Create a new role
   *
   * Request body:
   * {
   *   "name": "content_admin",
   *   "permissions": ["create_question", "edit_question"]
   * }
   *
   * Response (201):
   * {
   *   "success": true,
   *   "message": "Role created successfully",
   *   "data": { ...role }
   * }
   */
  static createRole = asyncHandler(async (req, res) => {
    const result = await RolesService.createRole(req.body);
    res.status(201).json(result);
  });

  /**
   * PUT /roles/:id
   * Update an existing role
   */
  static updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await RolesService.updateRole(id, req.body);
    res.status(200).json(result);
  });

  /**
   * GET /roles
   * List all roles
   */
  static getRoles = asyncHandler(async (req, res) => {
    const result = await RolesService.getRoles();
    res.status(200).json(result);
  });

  /**
   * POST /roles/assign
   * Assign a role to a user
   *
   * Request body:
   * {
   *   "userId": "64f1c2...",
   *   "role": "content_admin"
   * }
   */
  static assignRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    const result = await RolesService.assignRole(userId, role);
    res.status(200).json(result);
  });

  /**
   * POST /roles/remove
   * Remove a role from a user
   */
  static removeRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    const result = await RolesService.removeRole(userId, role);
    res.status(200).json(result);
  });

  /**
   * GET /roles/permissions
   * List all known permissions
   *
   * Response (200):
   * {
   *   "success": true,
   *   "data": ["manage_users", "assign_roles", ...]
   * }
   */
  static getPermissions = asyncHandler(async (req, res) => {
    const result = await RolesService.getAllPermissions();
    res.status(200).json(result);
  });
}

module.exports = RolesController;


