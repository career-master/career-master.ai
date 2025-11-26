const mongoose = require('mongoose');

/**
 * Roles Schema
 * Stores role definitions with permissions
 * Used for Role-Based Access Control (RBAC)
 */
const rolesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      enum: {
        values: [
          'super_admin',
          'technical_admin',
          'content_admin',
          'institution_admin',
          'partner',
          'parent',
          'subscriber',
          'student'
        ],
        message: 'Invalid role name'
      }
    },
    permissions: {
      type: [String],
      required: [true, 'Permissions array is required'],
      default: []
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

// Indexes
rolesSchema.index({ name: 1 }, { unique: true });
rolesSchema.index({ permissions: 1 });

// Instance method to check if role has a specific permission
rolesSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Instance method to add permission
rolesSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this;
};

// Instance method to remove permission
rolesSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this;
};

const Role = mongoose.model('Role', rolesSchema);

module.exports = Role;
