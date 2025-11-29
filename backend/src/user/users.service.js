const UsersRepository = require('./users.repository');

class UsersService {
  static async getUserById(id) {
    return UsersRepository.getUserById(id);
  }

  static async listUsers({ page = 1, limit = 10, search = '', role, batch }) {
    return UsersRepository.getUsersPaginated({ page, limit, search, role, batch });
  }

  static async createUser(payload) {
    return UsersRepository.createUser(payload);
  }

  static async updateUser(id, updates) {
    return UsersRepository.updateUser(id, updates);
  }

  static async deleteUser(id) {
    return UsersRepository.deleteUser(id);
  }
}

module.exports = UsersService;


