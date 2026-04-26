// ============================================================
// Payment Processing Service
// Stripe & Razorpay Integration
// ============================================================

class PaymentService {
  constructor() {
    this.provider = process.env.PAYMENT_PROVIDER || 'stripe'

    if (this.provider === 'stripe') {
      const stripe = require('stripe')
      this.stripe = new stripe(process.env.STRIPE_SECRET_KEY)
    } else if (this.provider === 'razorpay') {
      const Razorpay = require('razorpay')
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    }
  }

  /**
   * Create donation incentive payment
   */
  async processDonationReward(userId, donationAmount, currency = 'USD') {
    try {
      if (this.provider === 'stripe') {
        return await this.processStripePayment(userId, donationAmount, currency, 'donation_reward')
      } else if (this.provider === 'razorpay') {
        return await this.processRazorpayPayment(
          userId,
          donationAmount,
          currency,
          'donation_reward'
        )
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error.message,
        message: 'Payment processing failed',
      }
    }
  }

  /**
   * Process Stripe payment
   */
  async processStripePayment(userId, amount, currency, description) {
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        description: `${description} for user ${userId}`,
        metadata: {
          userId: userId,
          type: description,
        },
      })

      return {
        success: true,
        provider: 'stripe',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
      }
    } catch (error) {
      console.error('Stripe error:', error)
      throw error
    }
  }

  /**
   * Process Razorpay payment
   */
  async processRazorpayPayment(userId, amount, currency, description) {
    try {
      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to smallest unit
        currency: currency.toUpperCase(),
        receipt: `donation_${userId}_${Date.now()}`,
        notes: {
          userId: userId,
          type: description,
        },
      })

      return {
        success: true,
        provider: 'razorpay',
        orderId: order.id,
        amount: amount,
        currency: currency,
        status: order.status,
      }
    } catch (error) {
      console.error('Razorpay error:', error)
      throw error
    }
  }

  /**
   * Verify payment webhook
   */
  async verifyWebhook(provider, payload, signature) {
    try {
      if (provider === 'stripe') {
        return this.verifyStripeWebhook(payload, signature)
      } else if (provider === 'razorpay') {
        return this.verifyRazorpayWebhook(payload, signature)
      }
    } catch (error) {
      console.error('Webhook verification error:', error)
      return { verified: false, error: error.message }
    }
  }

  /**
   * Verify Stripe webhook
   */
  verifyStripeWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      return {
        verified: true,
        event: event,
      }
    } catch (error) {
      console.error('Stripe webhook error:', error)
      return { verified: false, error: error.message }
    }
  }

  /**
   * Verify Razorpay webhook
   */
  verifyRazorpayWebhook(payload, signature) {
    try {
      const crypto = require('crypto')
      const hash = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex')

      return {
        verified: hash === signature,
        payload: payload,
      }
    } catch (error) {
      console.error('Razorpay webhook error:', error)
      return { verified: false, error: error.message }
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, amount, reason) {
    try {
      if (this.provider === 'stripe') {
        const refund = await this.stripe.refunds.create({
          payment_intent: transactionId,
          reason: reason,
          metadata: { refundReason: reason },
        })

        return {
          success: true,
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        }
      } else if (this.provider === 'razorpay') {
        const refund = await this.razorpay.payments.refund(transactionId, {
          amount: Math.round(amount * 100),
          notes: { reason: reason },
        })

        return {
          success: true,
          refundId: refund.id,
          amount: amount,
          status: refund.status,
        }
      }
    } catch (error) {
      console.error('Refund error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      if (this.provider === 'stripe') {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId)
        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        }
      } else if (this.provider === 'razorpay') {
        const payment = await this.razorpay.payments.fetch(paymentId)
        return {
          id: payment.id,
          status: payment.status,
          amount: payment.amount / 100,
          currency: payment.currency,
        }
      }
    } catch (error) {
      console.error('Payment status error:', error)
      return { error: error.message }
    }
  }

  /**
   * Create subscription (for recurring rewards)
   */
  async createSubscription(userId, planId, paymentMethod) {
    try {
      if (this.provider === 'stripe') {
        const subscription = await this.stripe.subscriptions.create({
          customer: userId,
          items: [{ price: planId }],
          default_payment_method: paymentMethod,
        })

        return {
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
        }
      }
    } catch (error) {
      console.error('Subscription creation error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = '') {
    try {
      if (this.provider === 'stripe') {
        const subscription = await this.stripe.subscriptions.del(subscriptionId)
        return {
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
        }
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get donation tax receipt
   */
  async generateTaxReceipt(userId, donationAmount, donationDate) {
    return {
      receiptId: `RCP_${Date.now()}`,
      donationAmount: donationAmount,
      date: donationDate,
      tax80GApplicable: true, // For India
      deductibleAmount: donationAmount, // 100% deductible
      status: 'GENERATED',
    }
  }
}

module.exports = new PaymentService()
