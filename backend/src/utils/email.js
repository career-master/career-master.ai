const nodemailer = require('nodemailer');
const env = require('../config/env');
const {
  getOTPTemplate,
  getWelcomeTemplate,
  getPasswordChangeTemplate
} = require('./emailTemplates');

/**
 * Email Utilities
 * Handles email sending using nodemailer with SMTP configuration
 */
class EmailUtil {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter
   */
  initializeTransporter() {
    try {
      // Check if SMTP credentials are provided
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        console.warn('⚠️  SMTP credentials not configured. Email functionality will be disabled.');
        console.warn('   SMTP_USER:', env.SMTP_USER ? 'Set' : 'NOT SET');
        console.warn('   SMTP_PASS:', env.SMTP_PASS ? 'Set' : 'NOT SET');
        this.transporter = null;
        return;
      }

      // Parse SMTP_SECURE correctly (handle string "true"/"false" from env vars)
      const smtpSecure = env.SMTP_SECURE === true || env.SMTP_SECURE === 'true';
      const smtpPort = parseInt(env.SMTP_PORT, 10) || 587;

      // Log SMTP configuration (without password)
      console.log('📧 Initializing SMTP transporter...');
      console.log(`   Host: ${env.SMTP_HOST}`);
      console.log(`   Port: ${smtpPort}`);
      console.log(`   Secure: ${smtpSecure}`);
      console.log(`   User: ${env.SMTP_USER}`);
      console.log(`   From: ${env.EMAIL_FROM}`);

      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        },
        // Connection timeout settings (increased for Render)
        connectionTimeout: 30000, // 30 seconds for Render
        greetingTimeout: 30000,
        socketTimeout: 30000,
        // For Gmail and similar services
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        // Additional options for better compatibility
        pool: true,
        maxConnections: 1,
        maxMessages: 3
      });

      // Verify connection configuration asynchronously (non-blocking)
      // Don't block server startup if SMTP is slow/unavailable
      setTimeout(() => {
        if (this.transporter) {
          console.log('🔄 Verifying SMTP connection...');
          this.transporter.verify((error) => {
            if (error) {
              console.error('❌ SMTP verification failed:', error.message);
              console.error('   Code:', error.code);
              console.error('   Command:', error.command);
              if (error.code === 'ETIMEDOUT') {
                console.error('   ⚠️  Connection timeout - Check:');
                console.error('      - SMTP_HOST is correct');
                console.error('      - SMTP_PORT is correct');
                console.error('      - Firewall allows outbound connections');
                console.error('      - SMTP server is accessible from Render network');
              }
              console.warn('   ⚠️  Server will continue, but emails may not work');
            } else {
              console.log('✅ SMTP server is ready to send emails');
            }
          });
        }
      }, 3000); // Wait 3 seconds before verifying (give Render time to initialize)
    } catch (error) {
      console.error('❌ Error initializing email transporter:', error);
      console.error('   Stack:', error.stack);
      console.warn('⚠️  Email functionality will be disabled. Server will continue running.');
      this.transporter = null;
    }
  }

  /**
   * Send OTP email for signup/verification
   * @param {string} email - Recipient email
   * @param {string} otp - OTP code
   * @param {string} purpose - Purpose of OTP (signup, forgot_password)
   * @returns {Promise<Object>} - Email send result
   */
  async sendOTPEmail(email, otp, purpose = 'signup') {
    try {
      if (!this.transporter) {
        console.warn('⚠️  Email transporter not initialized. SMTP credentials may be missing.');
        throw new Error('Email service is not configured. Please contact support.');
      }

      const subjectMap = {
        signup: 'Verify Your Email - Career Master',
        forgot_password: 'Reset Your Password - Career Master',
        login: 'Login OTP - Career Master'
      };

      // Use clean email template
      const htmlContent = getOTPTemplate(otp, purpose, env.OTP_EXPIRY_MINUTES);
      const textContent = `Your verification code is: ${otp}. This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.`;

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: subjectMap[purpose] || 'OTP Verification - Career Master',
        html: htmlContent,
        text: textContent
      };

      console.log(`📧 Sending OTP email to: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error command:', error.command);
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        throw new Error(`SMTP connection failed. Please check SMTP configuration in Render environment variables.`);
      }
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send welcome email after successful signup
   * @param {string} email - Recipient email
   * @param {string} name - User name
   * @returns {Promise<Object>} - Email send result
   */
  async sendWelcomeEmail(email, name) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Use clean welcome email template
      const htmlContent = getWelcomeTemplate(name);
      const textContent = `Welcome ${name}! Your account has been successfully verified. You can now log in and start using Career Master.`;

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Career Master!',
        html: htmlContent,
        text: textContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password change notification email
   * @param {string} email - Recipient email
   * @param {string} name - User name
   * @returns {Promise<Object>} - Email send result
   */
  async sendPasswordChangeNotification(email, name) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Use clean password change notification template
      const htmlContent = getPasswordChangeTemplate(name);
      const textContent = `Hello ${name}, your password has been successfully changed. If you didn't make this change, please contact support immediately.`;

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Changed Successfully - Career Master',
        html: htmlContent,
        text: textContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Error sending password change notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>} - True if email service is working
   */
  async testEmailConfig() {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const emailUtil = new EmailUtil();
module.exports = emailUtil;
