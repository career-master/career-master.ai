const Role = require('./roles.model');
const User = require('../user/users.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Roles Service
 * Business logic for role and permission management
 */
class RolesService {
  /**
   * Check if user has a specific permission
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} - True if user has permission
   */
  static async userHasPermission(userId, permission) {
    try {
      const user = await User.findById(userId);

      if (!user || user.status !== 'active') {
        return false;
      }

      // Super admin has all permissions
      if (user.roles.includes('super_admin')) {
        return true;
      }

      // Get all roles with permissions
      const roles = await Role.find({
        name: { $in: user.roles }
      });

      // Check if any role has the required permission
      const hasPermission = roles.some(role =>
        role.permissions && role.permissions.includes(permission)
      );

      return hasPermission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of permission strings
   */
  static async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId);

      if (!user || user.status !== 'active') {
        return [];
      }

      // Super admin has all permissions (return wildcard)
      if (user.roles.includes('super_admin')) {
        return ['*'];
      }

      // Get all roles with permissions
      const roles = await Role.find({
        name: { $in: user.roles }
      });

      // Collect all unique permissions
      const permissionsSet = new Set();
      roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(perm => permissionsSet.add(perm));
        }
      });

      return Array.from(permissionsSet);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get role by name
   * @param {string} roleName - Role name
   * @returns {Promise<Object|null>} - Role document or null
   */
  static async getRoleByName(roleName) {
    try {
      const role = await Role.findOne({ name: roleName.toLowerCase() });
      return role;
    } catch (error) {
      throw new ErrorHandler(500, `Error getting role: ${error.message}`);
    }
  }

  /**
   * Create or update role
   * @param {string} roleName - Role name
   * @param {Array} permissions - Array of permission strings
   * @param {string} description - Role description (optional)
   * @returns {Promise<Object>} - Created or updated role document
   */
  static async createOrUpdateRole(roleName, permissions, description = '') {
    try {
      const role = await Role.findOneAndUpdate(
        { name: roleName.toLowerCase() },
        {
          name: roleName.toLowerCase(),
          permissions: permissions || [],
          description
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      return role;
    } catch (error) {
      throw new ErrorHandler(500, `Error creating/updating role: ${error.message}`);
    }
  }

  /**
   * Get all roles
   * @returns {Promise<Array>} - Array of role documents
   */
  static async getAllRoles() {
    try {
      const roles = await Role.find().sort({ name: 1 });
      return roles;
    } catch (error) {
      throw new ErrorHandler(500, `Error getting roles: ${error.message}`);
    }
  }

  /**
   * Initialize default roles with permissions
   * This should be called once during application setup
   * @returns {Promise<void>}
   */
  static async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        {
          name: 'super_admin',
          permissions: ['*'], // All permissions
          description: 'Super administrator with all permissions'
        },
        {
          name: 'technical_admin',
          permissions: [
            'user.create',
            'user.update',
            'user.delete',
            'user.view',
            'system.config'
          ],
          description: 'Technical administrator'
        },
        {
          name: 'content_admin',
          permissions: [
            'content.create',
            'content.update',
            'content.delete',
            'content.view'
          ],
          description: 'Content administrator'
        },
        {
          name: 'institution_admin',
          permissions: [
            'institution.create',
            'institution.update',
            'institution.view',
            'student.view'
          ],
          description: 'Institution administrator'
        },
        {
          name: 'partner',
          permissions: [
            'partner.content.view',
            'partner.reports.view'
          ],
          description: 'Partner user'
        },
        {
          name: 'parent',
          permissions: [
            'student.view.own',
            'reports.view.own'
          ],
          description: 'Parent user'
        },
        {
          name: 'subscriber',
          permissions: [
            'content.view',
            'courses.view'
          ],
          description: 'Subscriber user'
        },
        {
          name: 'student',
          permissions: [
            'profile.view.own',
            'profile.update.own',
            'courses.view',
            'courses.enroll'
          ],
          description: 'Student user'
        }
      ];

      for (const roleData of defaultRoles) {
        await this.createOrUpdateRole(
          roleData.name,
          roleData.permissions,
          roleData.description
        );
      }

      console.log('✅ Default roles initialized');
    } catch (error) {
      console.error('❌ Error initializing default roles:', error);
      throw error;
    }
  }
}

module.exports = RolesService;
