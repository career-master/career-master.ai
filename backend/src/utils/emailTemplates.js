/**
 * Email Templates
 * Clean, responsive HTML email templates for Career Master
 */

const env = require('../config/env');

/**
 * Base email template wrapper
 */
const getBaseTemplate = (content, title) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Career Master
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 10px;">
                      This email was sent by <strong>Career Master</strong>
                    </p>
                    <p style="margin: 0 0 10px; color: #9ca3af;">
                      If you didn't request this email, you can safely ignore it.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Career Master. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * OTP Email Template
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose (signup, forgot_password, login)
 * @param {number} expiryMinutes - Expiry time in minutes
 */
const getOTPTemplate = (otp, purpose = 'signup', expiryMinutes = 10) => {
  const purposeConfig = {
    signup: {
      title: 'Verify Your Email Address',
      greeting: 'Welcome to Career Master!',
      message: 'Thank you for signing up. To complete your registration, please verify your email address by entering the verification code below:',
      actionText: 'Enter this code in the verification page to create your account.',
    },
    forgot_password: {
      title: 'Reset Your Password',
      greeting: 'Password Reset Request',
      message: 'You requested to reset your password. Use the verification code below to reset it:',
      actionText: 'Enter this code in the password reset page to set a new password.',
    },
    login: {
      title: 'Login Verification',
      greeting: 'Login Verification Code',
      message: 'Use the verification code below to complete your login:',
      actionText: 'Enter this code to sign in to your account.',
    },
  };

  const config = purposeConfig[purpose] || purposeConfig.signup;

  const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
        ${config.title}
      </h2>
      
      <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
        ${config.greeting}
      </p>
      
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 15px; line-height: 1.6;">
        ${config.message}
      </p>
      
      <!-- OTP Code Box -->
      <div style="margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="margin: 0 0 15px; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
          Verification Code
        </p>
        <div style="display: inline-block; padding: 20px 40px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <span style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </span>
        </div>
      </div>
      
      <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        ${config.actionText}
      </p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
          <strong>⏰ Important:</strong> This code will expire in <strong>${expiryMinutes} minutes</strong>. 
          Please use it before it expires.
        </p>
      </div>
      
      <p style="margin: 30px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
        If you didn't request this ${purpose === 'signup' ? 'verification' : 'code'}, please ignore this email or contact our support team if you have concerns.
      </p>
    </div>
  `;

  return getBaseTemplate(content, config.title);
};

/**
 * Welcome Email Template
 * @param {string} name - User's name
 */
const getWelcomeTemplate = (name) => {
  const content = `
    <div style="text-align: center;">
      <div style="margin: 0 0 30px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✓</span>
        </div>
      </div>
      
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700;">
        Welcome to Career Master, ${name}!
      </h2>
      
      <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.7;">
        Your account has been successfully created and verified. You're all set to start your learning journey with us!
      </p>
      
      <div style="margin: 40px 0; padding: 30px; background-color: #f9fafb; border-radius: 8px; text-align: left;">
        <h3 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
          What's Next?
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Explore our comprehensive course catalog</li>
          <li style="margin-bottom: 10px;">Complete your profile to get personalized recommendations</li>
          <li style="margin-bottom: 10px;">Join study groups and connect with other learners</li>
          <li>Start your first course and track your progress</li>
        </ul>
      </div>
      
      <div style="margin: 40px 0;">
        <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          Go to Dashboard
        </a>
      </div>
      
      <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        If you have any questions, feel free to reach out to our support team. We're here to help!
      </p>
    </div>
  `;

  return getBaseTemplate(content, 'Welcome to Career Master!');
};

/**
 * Password Change Notification Template
 * @param {string} name - User's name
 * @param {string} timestamp - When password was changed
 */
const getPasswordChangeTemplate = (name, timestamp = null) => {
  const changeTime = timestamp 
    ? new Date(timestamp).toLocaleString('en-US', { 
        dateStyle: 'long', 
        timeStyle: 'short' 
      })
    : new Date().toLocaleString('en-US', { 
        dateStyle: 'long', 
        timeStyle: 'short' 
      });

  const content = `
    <div style="text-align: center;">
      <div style="margin: 0 0 30px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px; color: #ffffff;">🔒</span>
        </div>
      </div>
      
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700;">
        Password Changed Successfully
      </h2>
      
      <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.7;">
        Hello ${name},
      </p>
      
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 15px; line-height: 1.7;">
        This is a confirmation that your password has been successfully changed.
      </p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: left;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
              <strong style="color: #374151;">Changed at:</strong>
            </td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
              ${changeTime}
            </td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 40px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; text-align: left;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact our support team immediately. 
          Your account security is important to us.
        </p>
      </div>
      
      <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        If you made this change, you can safely ignore this email.
      </p>
    </div>
  `;

  return getBaseTemplate(content, 'Password Changed Successfully');
};

/**
 * Subject Access Approval Email Template
 * @param {string} name - User's name
 * @param {string} subjectTitle - Subject title
 */
const getSubjectAccessApprovalTemplate = (name, subjectTitle) => {
  const content = `
    <div style="text-align: center;">
      <div style="margin: 0 0 30px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px; color: #ffffff;">🎉</span>
        </div>
      </div>
      
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700;">
        Congratulations, ${name}!
      </h2>
      
      <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.7;">
        Your request to access <strong>${subjectTitle}</strong> has been approved!
      </p>
      
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 15px; line-height: 1.7;">
        You now have full access to all topics, cheatsheets, and quizzes in this subject. Start learning and continue your course journey!
      </p>
      
      <div style="margin: 40px 0; padding: 30px; background-color: #f0fdf4; border-radius: 8px; text-align: left; border-left: 4px solid #10b981;">
        <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
          What You Can Do Now:
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Access all topics and study materials</li>
          <li style="margin-bottom: 10px;">Take quizzes and track your progress</li>
          <li style="margin-bottom: 10px;">Complete assignments and assessments</li>
          <li>Explore new content as it's added to the subject</li>
        </ul>
      </div>
      
      <div style="margin: 40px 0;">
        <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/subjects" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          Continue Your Course
        </a>
      </div>
      
      <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Happy learning! If you have any questions, feel free to reach out to our support team.
      </p>
    </div>
  `;

  return getBaseTemplate(content, 'Subject Access Approved - Career Master');
};

module.exports = {
  getOTPTemplate,
  getWelcomeTemplate,
  getPasswordChangeTemplate,
  getSubjectAccessApprovalTemplate,
};

