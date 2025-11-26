const nodemailer = require('nodemailer');
const env = require('../config/env');

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
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        },
        // For Gmail and similar services
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error) => {
        if (error) {
          console.error('❌ SMTP configuration error:', error);
        } else {
          console.log('✅ SMTP server is ready to send emails');
        }
      });
    } catch (error) {
      console.error('❌ Error initializing email transporter:', error);
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
        throw new Error('Email transporter not initialized');
      }

      const subjectMap = {
        signup: 'Verify Your Email - Career Master',
        forgot_password: 'Reset Your Password - Career Master',
        login: 'Login OTP - Career Master'
      };

      const messageMap = {
        signup: `
          <h2>Welcome to Career Master!</h2>
          <p>Thank you for signing up. Please verify your email address by entering the OTP below:</p>
          <h1 style="color: #4F46E5; font-size: 32px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
        forgot_password: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the OTP below to reset it:</p>
          <h1 style="color: #4F46E5; font-size: 32px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        login: `
          <h2>Login OTP</h2>
          <p>Use the OTP below to complete your login:</p>
          <h1 style="color: #4F46E5; font-size: 32px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        `
      };

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: subjectMap[purpose] || 'OTP Verification - Career Master',
        html: messageMap[purpose] || `
          <h2>OTP Verification</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
        `,
        text: `Your OTP is: ${otp}. This OTP will expire in 10 minutes.`
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
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

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Career Master!',
        html: `
          <h2>Welcome ${name}!</h2>
          <p>Your account has been successfully verified. You can now log in and start using Career Master.</p>
          <p>Thank you for joining us!</p>
        `,
        text: `Welcome ${name}! Your account has been successfully verified.`
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

      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Changed Successfully - Career Master',
        html: `
          <h2>Password Changed</h2>
          <p>Hello ${name},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        `,
        text: `Hello ${name}, your password has been successfully changed.`
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
