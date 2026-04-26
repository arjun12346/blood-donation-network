// ============================================================
// Email Service - SendGrid Integration
// ============================================================
const sgMail = require('@sendgrid/mail')

class EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured')
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@blooddonationnetwork.com'
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Blood Donation Network'
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    try {
      const msg = {
        to: email,
        from: { email: this.fromEmail, name: this.fromName },
        subject: '🩸 Welcome to Blood Donation Network',
        html: `
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for registering with Blood Donation Network.</p>
          <p>Your role has been set up and you can now:</p>
          <ul>
            <li>Browse emergency blood requests</li>
            <li>Post blood requests</li>
            <li>Connect with donors in your area</li>
            <li>Track your donation history</li>
          </ul>
          <p>Start helping lives today! 🩸</p>
          <hr>
          <p><strong>Blood Donation Network Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Welcome email sent to ${email}`)
      return { success: true, message: 'Welcome email sent' }
    } catch (error) {
      console.error(`❌ Welcome Email Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, verificationLink) {
    try {
      const msg = {
        to: email,
        from: { email: this.fromEmail, name: this.fromName },
        subject: '🔒 Verify Your Email - Blood Donation Network',
        html: `
          <h2>Email Verification</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Link expires in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr>
          <p><strong>Blood Donation Network Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Verification email sent to ${email}`)
      return { success: true, message: 'Verification email sent' }
    } catch (error) {
      console.error(`❌ Verification Email Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetLink) {
    try {
      const msg = {
        to: email,
        from: { email: this.fromEmail, name: this.fromName },
        subject: '🔐 Reset Your Password - Blood Donation Network',
        html: `
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the link below:</p>
          <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p><strong>Blood Donation Network Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Password reset email sent to ${email}`)
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error(`❌ Password Reset Email Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send emergency blood request notification
   */
  async sendBloodRequestNotification(donorEmail, requestDetails) {
    try {
      const msg = {
        to: donorEmail,
        from: { email: this.fromEmail, name: this.fromName },
        subject: `🚨 URGENT: ${requestDetails.bloodGroup} Blood Needed in ${requestDetails.location}`,
        html: `
          <h2>🚨 Emergency Blood Request</h2>
          <p><strong>Blood Type:</strong> ${requestDetails.bloodGroup}</p>
          <p><strong>Location:</strong> ${requestDetails.location}</p>
          <p><strong>Hospital:</strong> ${requestDetails.hospital}</p>
          <p><strong>Patient Condition:</strong> ${requestDetails.message}</p>
          <p><strong>Units Needed:</strong> ${requestDetails.units}</p>
          <br>
          <p><a href="${requestDetails.actionLink}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">RESPOND NOW</a></p>
          <p>Every second counts. Your donation could save a life.</p>
          <hr>
          <p><strong>Blood Donation Network Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Blood request notification sent to ${donorEmail}`)
      return { success: true, message: 'Request notification sent' }
    } catch (error) {
      console.error(`❌ Request Notification Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send donation success confirmation
   */
  async sendDonationSuccessEmail(donorEmail, donorName, recipientName) {
    try {
      const msg = {
        to: donorEmail,
        from: { email: this.fromEmail, name: this.fromName },
        subject: '❤️ Thank You for Your Life-Saving Donation!',
        html: `
          <h2>Donation Successful! ❤️</h2>
          <p>Dear ${donorName},</p>
          <p>Thank you for your generous donation! Your ${process.env.DONOR_BLOOD_GROUP || 'blood'} donation has successfully helped <strong>${recipientName}</strong>.</p>
          <p>You've earned:</p>
          <ul>
            <li>💎 10 Trust Points</li>
            <li>🏆 Achievement Badge: Life Saver</li>
            <li>📊 Updated Donation History</li>
          </ul>
          <p>Next donation possible after 56 days.</p>
          <p>Thank you for being a hero!</p>
          <hr>
          <p><strong>Blood Donation Network Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Donation success email sent to ${donorEmail}`)
      return { success: true, message: 'Donation success email sent' }
    } catch (error) {
      console.error(`❌ Donation Success Email Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send fraud alert
   */
  async sendFraudAlert(email, reason, actionLink) {
    try {
      const msg = {
        to: email,
        from: { email: this.fromEmail, name: this.fromName },
        subject: '🔒 Account Security Alert - Unusual Activity',
        html: `
          <h2>Security Alert</h2>
          <p>We detected unusual activity on your account:</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If this wasn't you, please secure your account immediately:</p>
          <a href="${actionLink}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Secure My Account</a>
          <p>Our security team is reviewing this incident.</p>
          <hr>
          <p><strong>Blood Donation Network Security Team</strong></p>
        `,
      }
      await sgMail.send(msg)
      console.log(`✅ Fraud alert sent to ${email}`)
      return { success: true, message: 'Fraud alert sent' }
    } catch (error) {
      console.error(`❌ Fraud Alert Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new EmailService()
