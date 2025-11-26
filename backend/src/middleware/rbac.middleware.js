const { ErrorHandler } = require('./errorHandler');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if user has required roles or permissions
 */

/**
 * Check if user has at least one of the required roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      const userRoles = req.user.roles || [];

      // Check if user has at least one of the required roles
      const hasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        throw new ErrorHandler(
          403,
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has all required roles
 * @param {string[]} requiredRoles - Array of required roles (all must be present)
 * @returns {Function} - Express middleware function
 */
const requireAllRoles = (...requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      const userRoles = req.user.roles || [];

      // Check if user has all required roles
      const hasAllRoles = requiredRoles.every(role => userRoles.includes(role));

      if (!hasAllRoles) {
        throw new ErrorHandler(
          403,
          `Access denied. Required all roles: ${requiredRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has a specific permission
 * Note: This requires roles service to check permissions
 * @param {string} permission - Required permission
 * @returns {Function} - Express middleware function
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      // Import roles service dynamically to avoid circular dependencies
      const RolesService = require('../roles/roles.service');
      const hasPermission = await RolesService.userHasPermission(
        req.user.userId,
        permission
      );

      if (!hasPermission) {
        throw new ErrorHandler(
          403,
          `Access denied. Required permission: ${permission}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissions - Array of allowed permissions
 * @returns {Function} - Express middleware function
 */
const requireAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      const RolesService = require('../roles/roles.service');

      // Check if user has any of the required permissions
      const permissionChecks = await Promise.all(
        permissions.map(permission =>
          RolesService.userHasPermission(req.user.userId, permission)
        )
      );

      const hasAnyPermission = permissionChecks.some(check => check === true);

      if (!hasAnyPermission) {
        throw new ErrorHandler(
          403,
          `Access denied. Required any permission: ${permissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Super admin only middleware (shortcut)
 */
const requireSuperAdmin = requireRole('super_admin');

module.exports = {
  requireRole,
  requireAllRoles,
  requirePermission,
  requireAnyPermission,
  requireSuperAdmin
};
