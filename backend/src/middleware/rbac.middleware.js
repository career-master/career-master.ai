const Role = require('../roles/roles.model');
const { ErrorHandler } = require('./errorHandler');

/**
 * RBAC Middleware
 * Role-based and permission-based access control.
 *
 * Assumes `authenticate` middleware has populated `req.user` with:
 * {
 *   userId: string,
 *   email: string,
 *   name: string,
 *   roles: string[]
 * }
 */

/**
 * Check if user has at least one of the required roles.
 * `super_admin` always passes.
 */
const userHasRequiredRole = (user, requiredRoles = []) => {
  if (!user || !Array.isArray(user.roles)) return false;

  const userRoles = user.roles.map((r) => r.toLowerCase());
  if (userRoles.includes('super_admin')) return true;

  const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());
  return normalizedRequired.some((role) => userRoles.includes(role));
};

/**
 * Require that the authenticated user has at least one of the given roles.
 * Usage: router.get('/admin', authenticate, requireRole(['super_admin']), handler)
 */
const requireRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      if (!userHasRequiredRole(req.user, roles)) {
        throw new ErrorHandler(403, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require that the authenticated user has at least one of the given permissions.
 * Permissions are resolved via the user's roles from the `roles` collection.
 * `super_admin` always passes.
 */
const requirePermission = (permissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ErrorHandler(401, 'Authentication required');
      }

      const requiredPermissions = permissions.map((p) => p.toLowerCase().trim());

      // If no specific permission required, just continue
      if (requiredPermissions.length === 0) {
        return next();
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles.map((r) => r.toLowerCase())
        : [];

      // `super_admin` bypasses permission checks
      if (userRoles.includes('super_admin')) {
        return next();
      }

      if (userRoles.length === 0) {
        throw new ErrorHandler(403, 'You do not have permission to access this resource');
      }

      // Load roles from DB and collect permissions
      const roles = await Role.find({ name: { $in: userRoles } });
      const userPermissionsSet = new Set();

      roles.forEach((role) => {
        (role.permissions || []).forEach((perm) => {
          if (typeof perm === 'string') {
            userPermissionsSet.add(perm.toLowerCase());
          }
        });
      });

      const hasPermission = requiredPermissions.some((perm) =>
        userPermissionsSet.has(perm)
      );

      if (!hasPermission) {
        throw new ErrorHandler(403, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
  requirePermission
};

