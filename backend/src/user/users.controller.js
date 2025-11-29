const UsersService = require('./users.service');
const { asyncHandler } = require('../middleware/errorHandler');

class UsersController {
  static getUserById = asyncHandler(async (req, res) => {
    const user = await UsersService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
  });

  static listUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const role = req.query.role;
    const batch = req.query.batch;

    const result = await UsersService.listUsers({ page, limit, search, role, batch });
    res.status(200).json({
      success: true,
      data: result
    });
  });

  static createUser = asyncHandler(async (req, res) => {
    const user = await UsersService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  });

  static updateUser = asyncHandler(async (req, res) => {
    const user = await UsersService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  });

  static deleteUser = asyncHandler(async (req, res) => {
    await UsersService.deleteUser(req.params.id);
    res.status(204).send();
  });
}

module.exports = UsersController;


