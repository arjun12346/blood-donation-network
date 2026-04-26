// ============================================================
// Phone Call Service - Twilio Voice
// ============================================================
const twilio = require('twilio')

class PhoneCallService {
  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    this.twilioNumber = process.env.TWILIO_PHONE_NUMBER
    this.webhookUrl = process.env.TWILIO_VOICE_WEBHOOK_URL
  }

  /**
   * Initiate a call to connect donor with receiver
   * @param {string} recipientPhone - E.164 format: +1234567890
   * @param {string} senderName - Name of person initiating call
   * @param {object} context - Call context (blood type, urgency, etc)
   * @returns {Promise<object>} - Call SID and details
   */
  async initiateCall(recipientPhone, senderName, context = {}) {
    try {
      if (!recipientPhone) throw new Error('Recipient phone required')

      const twiml = new twilio.twiml.VoiceResponse()

      // Greeting
      twiml.say(
        `Hello! You have received a call from ${senderName} regarding an emergency blood donation request.`,
        { voice: 'alice', language: 'en-US' }
      )

      // Play blood type info
      if (context.bloodGroup) {
        twiml.say(`Blood type needed: ${context.bloodGroup}`)
      }

      // Add action prompt
      twiml.say('Press 1 to accept, or 2 to decline.', { voice: 'alice' })

      // Gather user input
      twiml.gather({
        numDigits: 1,
        action: `${this.webhookUrl}?call_id=${context.requestId}`,
        method: 'POST',
        timeout: 5,
      })

      const call = await this.client.calls.create({
        to: recipientPhone,
        from: this.twilioNumber,
        twiml: twiml.toString(),
        statusCallback: `${this.webhookUrl}/status`,
        statusCallbackMethod: 'POST',
        record: true, // Record for quality assurance
      })

      console.log(`✅ Call initiated to ${recipientPhone}. Call SID: ${call.sid}`)
      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        message: 'Call initiated successfully',
      }
    } catch (error) {
      console.error(`❌ Call Initiation Error: ${error.message}`)
      return {
        success: false,
        error: error.message,
        message: 'Failed to initiate call',
      }
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - E.164 format: +1234567890
   * @param {string} message - SMS message
   * @returns {Promise<object>} - Message SID and status
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!phoneNumber || !message) throw new Error('Phone and message required')

      const sms = await this.client.messages.create({
        body: message,
        from: this.twilioNumber,
        to: phoneNumber,
      })

      console.log(`✅ SMS sent to ${phoneNumber}. Message SID: ${sms.sid}`)
      return {
        success: true,
        messageSid: sms.sid,
        status: sms.status,
        message: 'SMS sent successfully',
      }
    } catch (error) {
      console.error(`❌ SMS Error: ${error.message}`)
      return {
        success: false,
        error: error.message,
        message: 'Failed to send SMS',
      }
    }
  }

  /**
   * Send emergency blood request alert via SMS
   */
  async sendBloodRequestAlert(phoneNumber, bloodGroup, location, hospital) {
    try {
      const message = `🚨 URGENT: ${bloodGroup} blood needed at ${hospital}, ${location}. Reply HELP for details or ACCEPT to help donate.`
      return await this.sendSMS(phoneNumber, message)
    } catch (error) {
      console.error(`❌ Alert SMS Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * End call
   */
  async endCall(callSid) {
    try {
      const call = await this.client.calls(callSid).update({ status: 'completed' })
      console.log(`✅ Call ended: ${callSid}`)
      return { success: true, message: 'Call ended' }
    } catch (error) {
      console.error(`❌ End Call Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get call recordings
   */
  async getCallRecordings(callSid) {
    try {
      const recordings = await this.client.calls(callSid).recordings.list()

      return {
        success: true,
        recordings: recordings.map((r) => ({
          sid: r.sid,
          url: r.uri,
          duration: r.duration,
        })),
      }
    } catch (error) {
      console.error(`❌ Get Recordings Error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new PhoneCallService()
