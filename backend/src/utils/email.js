const { Resend } = require('resend');
const env = require('../config/env');
const {
  getOTPTemplate,
  getWelcomeTemplate,
  getPasswordChangeTemplate
} = require('./emailTemplates');

/**
 * Email Utilities
 * Uses Resend API exclusively for email delivery
 */
class EmailUtil {
  constructor() {
    this.resend = null;
    this.emailFrom = null; // Will be set during initialization
    this.initializeEmailService();
  }

  /**
   * Initialize email service - Resend API only
   */
  initializeEmailService() {
    if (!env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      console.error('   Email functionality will be disabled.');
      console.error('   Please set RESEND_API_KEY in your .env file or Render environment variables');
      return;
    }

    try {
      // Validate API key format (should start with 're_')
      if (!env.RESEND_API_KEY.startsWith('re_')) {
        console.error('❌ Invalid Resend API key format. Should start with "re_"');
        console.error('   Email functionality will be disabled.');
        return;
      }

      // Check if EMAIL_FROM is a Gmail address - Resend requires domain verification
      // Use onboarding@resend.dev for testing without domain verification
      if (env.EMAIL_FROM && env.EMAIL_FROM.includes('@gmail.com')) {
        console.warn('⚠️  Gmail addresses require domain verification in Resend.');
        console.warn('   Using onboarding@resend.dev for sending (works without verification).');
        console.warn('   Your Gmail address will still appear in the "From Name" field.');
        this.emailFrom = 'onboarding@resend.dev';
      } else if (env.EMAIL_FROM && !env.EMAIL_FROM.includes('@resend.dev')) {
        // If using a custom domain, it must be verified in Resend
        console.warn('⚠️  Make sure your domain is verified in Resend: https://resend.com/domains');
        this.emailFrom = env.EMAIL_FROM;
      } else {
        // Use onboarding@resend.dev as default if not set or already using resend.dev
        this.emailFrom = env.EMAIL_FROM || 'onboarding@resend.dev';
      }

      this.resend = new Resend(env.RESEND_API_KEY);
      console.log('📧 Initializing Resend API...');
      console.log(`   API Key: ${env.RESEND_API_KEY.substring(0, 10)}...`);
      console.log(`   From: ${this.emailFrom}`);
      console.log(`   From Name: ${env.EMAIL_FROM_NAME}`);
      console.log('✅ Resend API initialized successfully');
      console.log('   Note: If you see network errors locally, check:');
      console.log('   1. Internet connection');
      console.log('   2. DNS settings (api.resend.com should resolve)');
      console.log('   3. Firewall/VPN blocking outbound HTTPS');
      console.log('   4. This should work fine on Render/Vercel production');
    } catch (error) {
      console.error('❌ Error initializing Resend API:', error);
      console.error('   Email functionality will be disabled.');
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
      if (!this.resend) {
        // Provide detailed error message for debugging
        const errorDetails = [];
        if (!env.RESEND_API_KEY) {
          errorDetails.push('RESEND_API_KEY is not set in environment variables');
        } else if (!env.RESEND_API_KEY.startsWith('re_')) {
          errorDetails.push(`RESEND_API_KEY format is invalid (should start with 're_', got: ${env.RESEND_API_KEY.substring(0, 10)}...)`);
        } else {
          errorDetails.push('Resend API initialization failed (check server logs)');
        }
        
        const errorMsg = `Email service is not configured. ${errorDetails.join('. ')}. Please set RESEND_API_KEY in Render environment variables.`;
        console.error('❌ Email service error:', errorMsg);
        throw new Error(errorMsg);
      }

      const subjectMap = {
        signup: 'Verify Your Email - Career Master',
        forgot_password: 'Reset Your Password - Career Master',
        login: 'Login OTP - Career Master'
      };

      const htmlContent = getOTPTemplate(otp, purpose, env.OTP_EXPIRY_MINUTES);
      const textContent = `Your verification code is: ${otp}. This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.`;
      const subject = subjectMap[purpose] || 'OTP Verification - Career Master';

      console.log(`📧 Sending OTP email to: ${email} (using Resend)`);

      // Format: "Display Name <email@domain.com>"
      // Always use this.emailFrom (onboarding@resend.dev) for the actual sending address
      // Extract display name from EMAIL_FROM_NAME if it contains an email, otherwise use as-is
      let displayName = env.EMAIL_FROM_NAME;
      if (displayName.includes('<') && displayName.includes('>')) {
        // Extract just the display name part (before the <)
        displayName = displayName.split('<')[0].trim();
      }
      const fromAddress = `${displayName} <${this.emailFrom || env.EMAIL_FROM}>`;
      
      // Retry logic for network issues
      const maxRetries = 3;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, error } = await this.resend.emails.send({
            from: fromAddress,
            to: email,
            subject: subject,
            html: htmlContent,
            text: textContent
          });

          if (error) {
            // If it's a validation error (like domain verification), don't retry
            if (error.name === 'validation_error' || error.statusCode === 403) {
              console.error('❌ Resend API validation error:', error);
              console.error('   Error name:', error.name);
              console.error('   Error message:', error.message);
              throw new Error(`Failed to send email via Resend: ${error.message}`);
            }
            
            // For network/application errors, retry
            lastError = error;
            if (attempt < maxRetries) {
              const delay = attempt * 1000; // 1s, 2s, 3s
              console.warn(`⚠️  Resend API error (attempt ${attempt}/${maxRetries}):`, error.message);
              console.warn(`   Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            console.error('❌ Resend API error after retries:', error);
            console.error('   Error name:', error.name);
            console.error('   Error message:', error.message);
            throw new Error(`Failed to send email via Resend: ${error.message}`);
          }

          // Success!
          console.log(`✅ OTP email sent successfully via Resend. Message ID: ${data.id}`);
          return {
            success: true,
            messageId: data.id,
            provider: 'resend'
          };
        } catch (networkError) {
          // Handle network errors (fetch failures, timeouts, etc.)
          if (networkError.message.includes('fetch') || 
              networkError.message.includes('resolve') ||
              networkError.message.includes('timeout') ||
              networkError.name === 'application_error') {
            lastError = networkError;
            if (attempt < maxRetries) {
              const delay = attempt * 1000;
              console.warn(`⚠️  Network error (attempt ${attempt}/${maxRetries}):`, networkError.message);
              console.warn(`   Possible causes: DNS issue, firewall, or network connectivity`);
              console.warn(`   Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            console.error('❌ Network error after retries:', networkError.message);
            console.error('   Possible causes:');
            console.error('   1. DNS resolution issue - Check internet connection');
            console.error('   2. Firewall/proxy blocking Resend API');
            console.error('   3. VPN or network restrictions');
            console.error('   4. Resend API temporarily unavailable');
            throw new Error(`Network error: Unable to connect to Resend API. ${networkError.message}`);
          }
          
          // Re-throw non-network errors
          throw networkError;
        }
      }
      
      // Should not reach here, but just in case
      throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);

      console.log(`✅ OTP email sent successfully via Resend. Message ID: ${data.id}`);
      return {
        success: true,
        messageId: data.id,
        provider: 'resend'
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
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
      if (!this.resend) {
        throw new Error('Resend API is not initialized. Please check RESEND_API_KEY configuration.');
      }

      const htmlContent = getWelcomeTemplate(name);
      const textContent = `Welcome ${name}! Your account has been successfully verified. You can now log in and start using Career Master.`;

      // Format: "Display Name <email@domain.com>"
      // Always use this.emailFrom (onboarding@resend.dev) for the actual sending address
      let displayName = env.EMAIL_FROM_NAME;
      if (displayName.includes('<') && displayName.includes('>')) {
        // Extract just the display name part (before the <)
        displayName = displayName.split('<')[0].trim();
      }
      const fromAddress = `${displayName} <${this.emailFrom || env.EMAIL_FROM}>`;
      
      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: email,
        subject: 'Welcome to Career Master!',
        html: htmlContent,
        text: textContent
      });

      if (error) {
        console.error('❌ Error sending welcome email via Resend:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'resend'
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
      if (!this.resend) {
        throw new Error('Resend API is not initialized. Please check RESEND_API_KEY configuration.');
      }

      const htmlContent = getPasswordChangeTemplate(name);
      const textContent = `Hello ${name}, your password has been successfully changed. If you didn't make this change, please contact support immediately.`;

      // Format: "Display Name <email@domain.com>"
      // Always use this.emailFrom (onboarding@resend.dev) for the actual sending address
      let displayName = env.EMAIL_FROM_NAME;
      if (displayName.includes('<') && displayName.includes('>')) {
        // Extract just the display name part (before the <)
        displayName = displayName.split('<')[0].trim();
      }
      const fromAddress = `${displayName} <${this.emailFrom || env.EMAIL_FROM}>`;
      
      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: email,
        subject: 'Password Changed Successfully - Career Master',
        html: htmlContent,
        text: textContent
      });

      if (error) {
        console.error('❌ Error sending password change notification via Resend:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'resend'
      };
    } catch (error) {
      console.error('❌ Error sending password change notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email configuration and connectivity
   * @returns {Promise<Object>} - Test result with details
   */
  async testEmailConfig() {
    const result = {
      initialized: !!this.resend,
      apiKeySet: !!env.RESEND_API_KEY,
      apiKeyFormat: env.RESEND_API_KEY ? env.RESEND_API_KEY.startsWith('re_') : false,
      emailFrom: this.emailFrom || env.EMAIL_FROM,
      connectivity: false,
      error: null
    };

    if (!this.resend) {
      result.error = 'Resend API not initialized';
      return result;
    }

    // Try to send a test email to verify connectivity
    try {
      const testEmail = 'test@example.com'; // Won't actually send, just test connection
      const { error } = await this.resend.emails.send({
        from: this.emailFrom || env.EMAIL_FROM,
        to: testEmail,
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test'
      });

      // Even if there's an error, if it's not a network error, connectivity is OK
      if (error) {
        if (error.name === 'application_error' || error.message.includes('fetch') || error.message.includes('resolve')) {
          result.error = `Network connectivity issue: ${error.message}`;
        } else {
          // Other errors (like validation) mean connectivity is fine
          result.connectivity = true;
          result.error = `Validation error (connectivity OK): ${error.message}`;
        }
      } else {
        result.connectivity = true;
      }
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('resolve') || err.message.includes('timeout')) {
        result.error = `Network error: ${err.message}`;
      } else {
        result.error = err.message;
      }
    }

    return result;
  }
}

// Export singleton instance
const emailUtil = new EmailUtil();
module.exports = emailUtil;
