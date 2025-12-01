const mongoose = require('mongoose');

/**
 * Role Schema
 * Stores role name and associated permissions
 *
 * Example:
 * {
 *   name: 'super_admin',
 *   permissions: ['manage_users', 'assign_roles', 'manage_roles'],
 * }
 */
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'Role name must be at least 2 characters'],
      maxlength: [100, 'Role name cannot exceed 100 characters']
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.every(p => typeof p === 'string' && p.trim().length > 0);
        },
        message: 'Permissions must be an array of non-empty strings'
      }
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ createdAt: -1 });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

