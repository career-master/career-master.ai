const User = require('../user/users.model');
const CryptoUtil = require('../utils/crypto');
const env = require('../config/env');

/**
 * Admin Seeding Service
 * Creates default admin user on server startup if it doesn't exist
 */
class AdminSeed {
  /**
   * Seed default admin user
   * @returns {Promise<void>}
   */
  static async seedAdminUser() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@careermaster.ai';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const adminName = process.env.ADMIN_NAME || 'System Admin';

      // Check if admin user already exists
      const existingAdmin = await User.findOne({ 
        email: adminEmail.toLowerCase(),
        roles: { $in: ['super_admin'] }
      });

      if (existingAdmin) {
        console.log('✅ Admin user already exists');
        return;
      }

      // Hash admin password
      const passwordHash = await CryptoUtil.hashPassword(adminPassword);

      // Create admin user
      const adminUser = new User({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash: passwordHash,
        roles: ['super_admin'],
        verification: {
          emailVerified: true // Admin email is pre-verified
        },
        status: 'active'
      });

      await adminUser.save();

      console.log('✅ Default admin user created successfully');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('   ⚠️  Please change the default password after first login!');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Admin user already exists (duplicate key)');
        return;
      }
      console.error('❌ Error seeding admin user:', error.message);
      // Don't throw - allow server to start even if admin seeding fails
    }
  }
}

module.exports = AdminSeed;

