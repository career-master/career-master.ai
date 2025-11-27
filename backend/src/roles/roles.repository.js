const Role = require('./roles.model');
const User = require('../user/users.model');
const { ErrorHandler } = require('../middleware/errorHandler');

/**
 * Roles Repository
 * Handles database operations for roles and user-role assignments
 */
class RolesRepository {
  /**
   * Create a new role
   * @param {Object} data
   * @param {string} data.name
   * @param {string[]} data.permissions
   * @returns {Promise<Object>}
   */
  static async createRole(data) {
    try {
      const role = new Role({
        name: data.name.toLowerCase().trim(),
        permissions: (data.permissions || []).map(p => p.toLowerCase().trim())
      });

      const saved = await role.save();
      return saved;
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new ErrorHandler(409, 'Role with this name already exists');
      }
      throw new ErrorHandler(500, `Error creating role: ${error.message}`);
    }
  }

  /**
   * Update an existing role
   * @param {string} roleId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async updateRole(roleId, data) {
    try {
      const update = {};

      if (data.name) {
        update.name = data.name.toLowerCase().trim();
      }

      if (Array.isArray(data.permissions)) {
        update.permissions = data.permissions.map(p => p.toLowerCase().trim());
      }

      const updated = await Role.findByIdAndUpdate(
        roleId,
        { $set: update },
        { new: true, runValidators: true }
      );

      return updated;
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new ErrorHandler(409, 'Role with this name already exists');
      }
      throw new ErrorHandler(500, `Error updating role: ${error.message}`);
    }
  }

  /**
   * Delete role by ID
   * NOTE: This does NOT remove the role name from user documents.
   * @param {string} roleId
   * @returns {Promise<boolean>}
   */
  static async deleteRole(roleId) {
    try {
      const result = await Role.findByIdAndDelete(roleId);
      return !!result;
    } catch (error) {
      throw new ErrorHandler(500, `Error deleting role: ${error.message}`);
    }
  }

  /**
   * Find role by name
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  static async findRoleByName(name) {
    try {
      const role = await Role.findOne({ name: name.toLowerCase().trim() });
      return role;
    } catch (error) {
      throw new ErrorHandler(500, `Error finding role by name: ${error.message}`);
    }
  }

  /**
   * Get all roles
   * @returns {Promise<Object[]>}
   */
  static async getAllRoles() {
    try {
      const roles = await Role.find().sort({ createdAt: 1 });
      return roles;
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching roles: ${error.message}`);
    }
  }

  /**
   * Assign role to user (by name)
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<Object|null>} updated user
   */
  static async assignRoleToUser(userId, roleName) {
    try {
      const sanitizedRole = roleName.toLowerCase().trim();

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { roles: sanitizedRole }
        },
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error assigning role to user: ${error.message}`);
    }
  }

  /**
   * Remove role from user (by name)
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<Object|null>} updated user
   */
  static async removeRoleFromUser(userId, roleName) {
    try {
      const sanitizedRole = roleName.toLowerCase().trim();

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { roles: sanitizedRole }
        },
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      throw new ErrorHandler(500, `Error removing role from user: ${error.message}`);
    }
  }
}

module.exports = RolesRepository;


