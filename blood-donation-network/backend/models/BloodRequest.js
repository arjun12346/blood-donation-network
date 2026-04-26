// ============================================================
// BloodRequest Model - Production-Grade Schema
// ============================================================
const mongoose = require('mongoose')

const bloodRequestSchema = new mongoose.Schema(
  {
    // ─── Requester Information ─────────────────────────────
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },

    // ─── Blood Requirement ─────────────────────────────────
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    unitsNeeded: { type: Number, required: true, min: 1, max: 20 },
    message: { type: String, required: true, maxlength: 1000 },

    // ─── Patient Information ───────────────────────────────
    patientName: { type: String, required: true },
    patientAge: Number,
    patientCondition: String, // Surgery, accident, illness, etc
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // ─── Hospital/Location Information ─────────────────────
    hospital: {
      name: { type: String, required: true },
      address: String,
      phone: String,
      department: String, // ICU, OR, etc
    },
    location: {
      text: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    nearestHospital: {
      name: { type: String, default: '' },
      distance: { type: String, default: '' },
      coordinates: { lat: Number, lng: Number },
    },

    // ─── Geographic/Regional ───────────────────────────────
    country: {
      code: String,
      name: String,
    },
    state: String,
    city: String,

    // ─── Fraud Detection & AI Analysis ─────────────────────
    fraudAnalysis: {
      overallScore: { type: Number, min: 0, max: 1, default: 0 },
      mlScore: { type: Number, min: 0, max: 1 },
      riskLevel: {
        type: String,
        enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'SAFE',
      },
      confidence: { type: Number, min: 0, max: 1 },
      reasons: [String],
      detailedScores: {
        userBehavior: Number,
        messageAnalysis: Number,
        patternDetection: Number,
        deviceFingerprint: Number,
        geolocation: Number,
      },
      flaggedAt: Date,
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewNotes: String,
    },

    // ─── Priority & Trust Analysis ─────────────────────────
    priorityLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    priorityReason: [String],
    priorityScore: { type: Number, min: 0, max: 100, default: 50 },

    trustScore: {
      type: String,
      enum: ['new', 'trusted', 'moderate', 'risk'],
      default: 'new',
    },

    // ─── Status Management ─────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired', 'flagged', 'rejected', 'completed'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    fulfillmentDate: Date,
    completionDate: Date,

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + parseInt(process.env.DONATION_EXPIRY_HOURS || 48) * 60 * 60 * 1000),
      index: true,
    },

    // ─── Donor Responses ────────────────────────────────────
    respondedDonors: [
      {
        donorId: mongoose.Schema.Types.ObjectId,
        responseTime: Date,
        status: { type: String, enum: ['interested', 'committed', 'completed', 'declined'] },
        updatedAt: Date,
      },
    ],
    selectedDonor: mongoose.Schema.Types.ObjectId,
    donorRating: { type: Number, min: 0, max: 5 },
    requesterRating: { type: Number, min: 0, max: 5 },

    // ─── Verification & Approval ───────────────────────────
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verificationNotes: String,
    verificationDate: Date,

    // ─── Reports & Complaints ──────────────────────────────
    reportedBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        reason: String,
        description: String,
        reportedAt: Date,
      },
    ],
    reportCount: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: String,

    // ─── Communication & Notifications ─────────────────────
    notificationsSent: [
      {
        donorId: mongoose.Schema.Types.ObjectId,
        type: { type: String }, // email, sms, push, call
        sentAt: Date,
        deliveryStatus: String,
      },
    ],
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: Date,

    // ─── Emergency Services Integration ────────────────────
    emergencyServicesAlerted: { type: Boolean, default: false },
    emergencyAlertTime: Date,
    emergencyServiceResponse: String,

    // ─── Blood Bank Integration ────────────────────────────
    bloodBankNotified: { type: Boolean, default: false },
    bloodBankNotificationTime: Date,
    bloodBankResponse: String,
    inventoryReserved: { type: Number, default: 0 },

    // ─── Metadata ───────────────────────────────────────────
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String,
    source: { type: String, enum: ['web', 'mobile_ios', 'mobile_android', 'call_center'] },
    campaignId: String,
  },
  { timestamps: true }
)

// ─── Indexes for Query Performance ─────────────────────────
bloodRequestSchema.index({ bloodGroup: 1, isActive: 1, priorityLevel: 1 })
bloodRequestSchema.index({ 'location.lat': 1, 'location.lng': 1 })
bloodRequestSchema.index({ createdAt: -1 })
bloodRequestSchema.index({ status: 1 })
bloodRequestSchema.index({ requester: 1 })
bloodRequestSchema.index({ expiresAt: 1 })
bloodRequestSchema.index({ 'fraudAnalysis.riskLevel': 1 })

// ─── Check and update expiry status ─────────────────────────
bloodRequestSchema.methods.checkExpiry = function () {
  if (new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired'
    this.isActive = false
  }
}

// ─── Auto-delete old notifications (cleanup) ───────────────
bloodRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }) // Delete after 90 days

// ─── Middleware: Auto-check expiry before querying ────────
bloodRequestSchema.pre(/^find/, function () {
  if (!this.getOptions().skipCheckExpiry) {
    this.find({ expiresAt: { $gt: new Date() } })
  }
})

module.exports = mongoose.model('BloodRequest', bloodRequestSchema)
