const RolesRepository = require('./roles.repository');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Roles Service
 * Contains business logic for roles and permissions
 */
class RolesService {
  /**
   * Default roles supported by the system
   */
  static DEFAULT_ROLES = [
    'super_admin',
    'technical_admin',
    'content_admin',
    'institution_admin',
    'partner',
    'parent',
    'subscriber',
    'student'
  ];

  /**
   * Default permissions in the system
   */
  static DEFAULT_PERMISSIONS = [
    'manage_users',
    'assign_roles',
    'manage_roles',
    'create_question',
    'edit_question',
    'delete_question',
    'view_reports',
    'view_institution_data',
    'create_test',
    'evaluate_test',
    'manage_subscriptions'
  ];

  /**
   * Mapping of default permissions per role.
   * This is easily extendable for future roles/permissions.
   */
  static ROLE_PERMISSION_MAP = {
    super_admin: [
      // super_admin gets everything
      ...RolesService.DEFAULT_PERMISSIONS
    ],
    technical_admin: [
      'manage_users',
      'assign_roles',
      'manage_roles',
      'view_reports'
    ],
    content_admin: [
      'create_question',
      'edit_question',
      'delete_question',
      'create_test'
    ],
    institution_admin: [
      'view_institution_data',
      'view_reports',
      'manage_users'
    ],
    partner: [
      'view_institution_data',
      'view_reports'
    ],
    parent: [
      'view_reports'
    ],
    subscriber: [
      'manage_subscriptions'
    ],
    student: [
      // typically minimal; no admin permissions
    ]
  };

  /**
   * Normalize role name
   * @param {string} role
   * @returns {string}
   */
  static normalizeRoleName(role) {
    return role.toLowerCase().trim();
  }

  /**
   * Normalize permissions array
   * @param {string[]} permissions
   * @returns {string[]}
   */
  static normalizePermissions(permissions = []) {
    return permissions
      .filter(p => typeof p === 'string')
      .map(p => p.toLowerCase().trim())
      .filter(p => p.length > 0);
  }

  /**
   * Validate that all permissions are known (for stricter setups)
   * Currently allows any string but can be toggled to strict mode.
   * @param {string[]} permissions
   */
  static validatePermissions(permissions = []) {
    if (!Array.isArray(permissions)) {
      throw new ErrorHandler(400, 'Permissions must be an array of strings');
    }

    const invalid = permissions.filter(p => typeof p !== 'string' || !p.trim());

    if (invalid.length > 0) {
      throw new ErrorHandler(400, 'Permissions must be non-empty strings');
    }
  }

  /**
   * Create a new role
   * @param {Object} payload
   * @param {string} payload.name
   * @param {string[]} payload.permissions
   */
  static async createRole(payload) {
    try {
      if (!payload?.name) {
        throw new ErrorHandler(400, 'Role name is required');
      }

      const name = RolesService.normalizeRoleName(payload.name);
      const permissions = RolesService.normalizePermissions(payload.permissions);

      RolesService.validatePermissions(permissions);

      const existing = await RolesRepository.findRoleByName(name);
      if (existing) {
        throw new ErrorHandler(409, 'Role with this name already exists');
      }

      const role = await RolesRepository.createRole({ name, permissions });

      return {
        success: true,
        message: 'Role created successfully',
        data: role
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error creating role: ${error.message}`);
    }
  }

  /**
   * Update an existing role
   * @param {string} roleId
   * @param {Object} payload
   */
  static async updateRole(roleId, payload) {
    try {
      if (!roleId) {
        throw new ErrorHandler(400, 'Role ID is required');
      }

      const updateData = {};

      if (payload.name) {
        updateData.name = RolesService.normalizeRoleName(payload.name);
      }

      if (payload.permissions) {
        const permissions = RolesService.normalizePermissions(payload.permissions);
        RolesService.validatePermissions(permissions);
        updateData.permissions = permissions;
      }

      const updated = await RolesRepository.updateRole(roleId, updateData);

      if (!updated) {
        throw new ErrorHandler(404, 'Role not found');
      }

      return {
        success: true,
        message: 'Role updated successfully',
        data: updated
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error updating role: ${error.message}`);
    }
  }

  /**
   * Assign a role to a user
   * @param {string} userId
   * @param {string} roleName
   */
  static async assignRole(userId, roleName) {
    try {
      if (!userId || !roleName) {
        throw new ErrorHandler(400, 'User ID and role name are required');
      }

      const normalizedRole = RolesService.normalizeRoleName(roleName);

      const role = await RolesRepository.findRoleByName(normalizedRole);
      if (!role) {
        throw new ErrorHandler(400, 'Invalid role name');
      }

      const user = await RolesRepository.assignRoleToUser(userId, normalizedRole);
      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }

      return {
        success: true,
        message: 'Role assigned to user successfully',
        data: {
          userId: user._id,
          roles: user.roles
        }
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error assigning role: ${error.message}`);
    }
  }

  /**
   * Remove a role from a user
   * @param {string} userId
   * @param {string} roleName
   */
  static async removeRole(userId, roleName) {
    try {
      if (!userId || !roleName) {
        throw new ErrorHandler(400, 'User ID and role name are required');
      }

      const normalizedRole = RolesService.normalizeRoleName(roleName);

      const user = await RolesRepository.removeRoleFromUser(userId, normalizedRole);
      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }

      return {
        success: true,
        message: 'Role removed from user successfully',
        data: {
          userId: user._id,
          roles: user.roles
        }
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error removing role: ${error.message}`);
    }
  }

  /**
   * Get all roles
   */
  static async getRoles() {
    try {
      const roles = await RolesRepository.getAllRoles();

      return {
        success: true,
        data: roles
      };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error fetching roles: ${error.message}`);
    }
  }

  /**
   * Get all known permissions
   */
  static async getAllPermissions() {
    return {
      success: true,
      data: RolesService.DEFAULT_PERMISSIONS
    };
  }

  /**
   * Seed default permissions (no DB write required, returned for reference)
   * @returns {Promise<{success: boolean, data: string[]}>}
   */
  static async seedDefaultPermissions() {
    return {
      success: true,
      message: 'Default permissions are static and ready to use',
      data: RolesService.DEFAULT_PERMISSIONS
    };
  }

  /**
   * Initialize default roles (public API used at server startup)
   * Safe to call multiple times.
   */
  static async initializeDefaultRoles() {
    return RolesService.seedDefaultRoles();
  }

  /**
   * Seed default roles with their default permissions.
   * Idempotent: safe to call multiple times.
   */
  static async seedDefaultRoles() {
    const createdOrUpdated = [];

    for (const roleName of RolesService.DEFAULT_ROLES) {
      const normalized = RolesService.normalizeRoleName(roleName);
      const permissions = RolesService.normalizePermissions(
        RolesService.ROLE_PERMISSION_MAP[normalized] || []
      );

      // Try to find existing role
      const existing = await RolesRepository.findRoleByName(normalized);

      if (!existing) {
        const created = await RolesRepository.createRole({
          name: normalized,
          permissions
        });
        createdOrUpdated.push(created);
      } else {
        // Update permissions if they differ
        const existingPerms = (existing.permissions || []).sort();
        const newPerms = permissions.sort();

        const changed =
          existingPerms.length !== newPerms.length ||
          existingPerms.some((p, idx) => p !== newPerms[idx]);

        if (changed) {
          const updated = await RolesRepository.updateRole(existing._id, {
            permissions
          });
          createdOrUpdated.push(updated);
        }
      }
    }

    return {
      success: true,
      message: 'Default roles seeded successfully',
      data: createdOrUpdated
    };
  }
}

module.exports = RolesService;
