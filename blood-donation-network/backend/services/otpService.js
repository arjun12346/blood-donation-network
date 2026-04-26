// ============================================================
// OTP Service - Real SMS via Twilio
// ============================================================
const twilio = require('twilio')

class OTPService {
  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  }

  /**
   * Send OTP to phone number via Twilio Verify
   * @param {string} phoneNumber - E.164 format: +1234567890
   * @returns {Promise<object>} - Verification SID and status
   */
  async sendOTP(phoneNumber) {
    try {
      if (!phoneNumber) throw new Error('Phone number required')

      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
        })

      console.log(`✅ OTP sent to ${phoneNumber}. SID: ${verification.sid}`)
      return {
        success: true,
        verificationSid: verification.sid,
        message: 'OTP sent successfully',
      }
    } catch (error) {
      console.error(`❌ OTP Send Error: ${error.message}`)
      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP',
      }
    }
  }

  /**
   * Verify OTP code
   * @param {string} phoneNumber - E.164 format: +1234567890
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise<object>} - Verification status
   */
  async verifyOTP(phoneNumber, otpCode) {
    try {
      if (!phoneNumber || !otpCode) throw new Error('Phone and OTP code required')

      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: otpCode,
        })

      if (verificationCheck.status === 'approved') {
        console.log(`✅ OTP verified for ${phoneNumber}`)
        return {
          success: true,
          verified: true,
          message: 'OTP verified successfully',
        }
      } else {
        return {
          success: false,
          verified: false,
          message: 'OTP verification failed',
        }
      }
    } catch (error) {
      console.error(`❌ OTP Verification Error: ${error.message}`)
      return {
        success: false,
        verified: false,
        error: error.message,
        message: 'OTP verification failed',
      }
    }
  }

  /**
   * Resend OTP
   * @param {string} phoneNumber - E.164 format: +1234567890
   * @returns {Promise<object>} - Resend status
   */
  async resendOTP(phoneNumber) {
    try {
      return await this.sendOTP(phoneNumber)
    } catch (error) {
      console.error(`❌ Resend OTP Error: ${error.message}`)
      return {
        success: false,
        error: error.message,
        message: 'Failed to resend OTP',
      }
    }
  }

  /**
   * Send OTP via voice call (fallback)
   * @param {string} phoneNumber - E.164 format: +1234567890
   * @returns {Promise<object>} - Call status
   */
  async sendOTPViaCall(phoneNumber) {
    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'call',
        })

      console.log(`✅ OTP call sent to ${phoneNumber}`)
      return {
        success: true,
        verificationSid: verification.sid,
        message: 'OTP call sent successfully',
      }
    } catch (error) {
      console.error(`❌ OTP Call Error: ${error.message}`)
      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP call',
      }
    }
  }
}

module.exports = new OTPService()
