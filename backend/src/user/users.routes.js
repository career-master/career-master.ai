const express = require('express');
const UsersController = require('./users.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createUserSchema, updateUserSchema, listUsersSchema, validate } = require('./users.validation');

const router = express.Router();

const adminMiddleware = [authenticate, requireRole(['super_admin', 'institution_admin'])];

// List users (paginated, with filters) - must come before /:id route
router.get('/', adminMiddleware, validate(listUsersSchema), UsersController.listUsers);

// Get user by ID
router.get('/:id', adminMiddleware, UsersController.getUserById);

// Create user
router.post('/', adminMiddleware, validate(createUserSchema), UsersController.createUser);

// Update user
router.put('/:id', adminMiddleware, validate(updateUserSchema), UsersController.updateUser);

// Delete user
router.delete('/:id', adminMiddleware, UsersController.deleteUser);

module.exports = router;


