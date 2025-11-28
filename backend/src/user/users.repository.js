const User = require('./users.model');
const CryptoUtil = require('../utils/crypto');
const { ErrorHandler } = require('../middleware/errorHandler');

class UsersRepository {
  static async getUsersPaginated({ page = 1, limit = 10, search = '', role, batch }) {
    try {
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        filter.roles = role;
      }
      if (batch) {
        filter.batches = batch;
      }

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter)
      ]);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return { items, total, page, limit, totalPages };
    } catch (error) {
      throw new ErrorHandler(500, `Error fetching users: ${error.message}`);
    }
  }

  static async createUser({ name, email, phone, password, roles = ['student'], batches = [] }) {
    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new ErrorHandler(409, 'User with this email already exists');
      }

      const passwordHash = await CryptoUtil.hashPassword(password);

      const user = new User({
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        roles,
        batches,
        verification: {
          emailVerified: true
        },
        status: 'active'
      });

      return await user.save();
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      throw new ErrorHandler(500, `Error creating user: ${error.message}`);
    }
  }

  static async updateUser(id, updates) {
    try {
      // Never allow direct password updates here
      delete updates.passwordHash;
      delete updates.password;

      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      if (!user) {
        throw new ErrorHandler(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ErrorHandler) throw error;
      throw new ErrorHandler(500, `Error updating user: ${error.message}`);
    }
  }
}

module.exports = UsersRepository;


