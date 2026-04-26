// ============================================================
// Emergency Alert Model
// ============================================================
const mongoose = require('mongoose')

const emergencyAlertSchema = new mongoose.Schema(
  {
    // ─── Alert Basics ────────────────────────────────────
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
    },
    type: {
      type: String,
      enum: ['blood_shortage', 'disaster', 'disease_outbreak', 'urgent_request', 'other'],
      required: true,
    },

    // ─── Location & Geographic Scope ──────────────────────
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      lat: Number,
      lng: Number,
      radiusKm: { type: Number, default: 50 },
    },

    // ─── Blood Requirements ───────────────────────────────
    bloodRequirements: [
      {
        bloodGroup: {
          type: String,
          enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'any'],
        },
        unitsNeeded: { type: Number, min: 1 },
        unitsReceived: { type: Number, default: 0 },
      },
    ],

    // ─── Creator Information ───────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },

    // ─── Status & Timeline ────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
    },
    activatedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    estimatedResolutionTime: Number, // in hours

    // ─── Notification Tracking ────────────────────────────
    notificationsSent: {
      total: { type: Number, default: 0 },
      pushed: { type: Number, default: 0 },
      emailed: { type: Number, default: 0 },
      smsed: { type: Number, default: 0 },
    },
    recipientCount: { type: Number, default: 0 },
    targetAudience: {
      type: String,
      enum: ['all_donors', 'nearby_donors', 'specific_region', 'organizations'],
      default: 'nearby_donors',
    },

    // ─── Responses & Tracking ─────────────────────────────
    responses: [
      {
        respondent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        respondentName: String,
        bloodGroup: String,
        unitsOffered: Number,
        contact: String,
        status: {
          type: String,
          enum: ['accepted', 'declined', 'completed', 'no_show'],
        },
        respondedAt: Date,
      },
    ],

    // ─── Additional Information ───────────────────────────
    contactPersonName: String,
    contactPersonPhone: String,
    contactPersonEmail: String,
    additionalNotes: String,
    attachments: [
      {
        type: String,
        url: String,
        uploadedAt: Date,
      },
    ],

    // ─── Auto-resolve ─────────────────────────────────────
    autoResolveIn: Number, // hours to auto-resolve if fully fulfilled
    isAutoResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// ─── Indexes ────────────────────────────────────────────
emergencyAlertSchema.index({ status: 1, severity: 1 })
emergencyAlertSchema.index({ 'location.lat': '2dsphere', 'location.lng': '2dsphere' })
emergencyAlertSchema.index({ createdBy: 1 })
emergencyAlertSchema.index({ createdAt: -1 })

// ─── Methods ────────────────────────────────────────────
emergencyAlertSchema.methods.addResponse = function (response) {
  this.responses.push(response)
  this.recipientCount = this.responses.length
  return this.save()
}

emergencyAlertSchema.methods.getProgress = function () {
  const total = this.bloodRequirements.reduce((sum, br) => sum + br.unitsNeeded, 0)
  const received = this.bloodRequirements.reduce((sum, br) => sum + br.unitsReceived, 0)
  return {
    total,
    received,
    percentage: Math.round((received / total) * 100),
    isFulfilled: received >= total,
  }
}

emergencyAlertSchema.methods.getStatistics = function () {
  const acceptedResponses = this.responses.filter((r) => r.status === 'accepted').length
  const completedResponses = this.responses.filter((r) => r.status === 'completed').length

  return {
    totalResponses: this.responses.length,
    acceptedResponses,
    completedResponses,
    responseRate: ((acceptedResponses / this.recipientCount) * 100).toFixed(1),
    notificationsSent: this.notificationsSent,
    progress: this.getProgress(),
  }
}

emergencyAlertSchema.methods.markResolved = function () {
  this.status = 'resolved'
  this.resolvedAt = new Date()
  return this.save()
}

emergencyAlertSchema.statics.findActiveAlerts = function () {
  return this.find({
    status: 'active',
    activatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })
}

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema)
