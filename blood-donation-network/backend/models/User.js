// ============================================================
// User Model - Production-Grade Donor & Receiver Schema
// ============================================================
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Information ─────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Don't return password by default
    },

    // ─── OAuth Fields ──────────────────────────────────────
    oauthProvider: {
      type: String,
      enum: ['google', 'github', 'apple', null],
      default: null,
    },
    oauthId: String,
    picture: String,

    // ─── Medical Information ───────────────────────────────
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    weight: { type: Number, min: 45 }, // kg
    hemoglobin: { type: Number }, // g/dL
    lastDonationDate: { type: Date, default: null },
    lastBloodTestDate: { type: Date, default: null },
    medicalConditions: [String], // Allergies, diseases, etc

    // ─── Geographic & Regional ─────────────────────────────
    role: {
      type: String,
      enum: ['donor', 'receiver', 'admin'],
      required: true,
      default: 'donor',
    },
    country: {
      code: { type: String, required: true }, // US, UK, IN, etc
      name: { type: String, required: true },
    },
    state: String,
    city: String,
    zipCode: String,
    location: {
      text: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    timezone: { type: String, default: 'UTC' },

    // ─── Verification & KYC ────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,

    phoneVerified: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },

    // Government ID Verification
    governmentIdVerified: { type: Boolean, default: false },
    governmentIdType: String, // aadhar, passport, driving_license, etc
    governmentIdNumber: String,
    governmentIdDocument: String, // URL to stored document

    // Medical Document Verification
    medicalDocsVerified: { type: Boolean, default: false },
    medicalDocuments: [
      {
        type: { type: String }, // blood_group_cert, health_report, etc
        url: String,
        uploadDate: Date,
        verificationStatus: String, // pending, verified, rejected
      },
    ],

    // KYC Status
    kycStatus: {
      type: String,
      enum: ['not_started', 'pending', 'verified', 'rejected'],
      default: 'not_started',
    },
    kycLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'full'],
      default: 'basic',
    },

    // ─── Trust & Reputation ────────────────────────────────
    trustScore: {
      type: String,
      enum: ['new', 'trusted', 'moderate', 'risk'],
      default: 'new',
    },
    trustPoints: { type: Number, default: 0, min: 0 },
    successfulDonations: { type: Number, default: 0 },
    failedDonations: { type: Number, default: 0 },
    receiverRating: { type: Number, min: 0, max: 5, default: 0 },
    donorRating: { type: Number, min: 0, max: 5, default: 0 },

    // ─── Activity Tracking ─────────────────────────────────
    requestCount: { type: Number, default: 0 },
    lastRequestTime: { type: Date, default: null },
    lastRequestLocation: { lat: Number, lng: Number },

    reportCount: { type: Number, default: 0 },
    reports: [
      {
        reportedBy: mongoose.Schema.Types.ObjectId,
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],
    isBanned: { type: Boolean, default: false },
    banReason: String,
    bannedUntil: Date,

    // ─── Device & Security ─────────────────────────────────
    deviceFingerprints: [
      {
        fingerprint: String,
        userAgent: String,
        ipAddress: String,
        lastUsed: Date,
        isTrusted: Boolean,
      },
    ],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    backupCodes: [String],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // ─── Preferences & Settings ────────────────────────────
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },

    // ─── Payment & Transactions ────────────────────────────
    stripeCustomerId: String,
    razorpayCustomerId: String,
    walletBalance: { type: Number, default: 0 },
    donationRewards: [
      {
        donationId: mongoose.Schema.Types.ObjectId,
        amount: Number,
        currency: String,
        date: Date,
        status: String,
      },
    ],

    // ─── Notifications ─────────────────────────────────────
    notifications: [
      {
        title: String,
        message: String,
        type: { type: String, enum: ['info', 'success', 'warning', 'error'] },
        read: { type: Boolean, default: false },
        relatedTo: mongoose.Schema.Types.ObjectId, // Request or donation ID
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],

    // ─── Account Status ────────────────────────────────────
    isActive: { type: Boolean, default: true },
    lastLoginDate: Date,
    deactivatedAt: Date,
    deactivationReason: String,
  },
  { timestamps: true }
)

// ─── Indexes for Performance ───────────────────────────────
userSchema.index({ email: 1 })
userSchema.index({ phone: 1 })
userSchema.index({ bloodGroup: 1 })
userSchema.index({ country: 1 })
userSchema.index({ 'location.lat': 1, 'location.lng': 1 })
userSchema.index({ trustScore: 1 })
userSchema.index({ createdAt: -1 })

// ─── Hash password before save ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    this.password = await bcrypt.hash(this.password, 12)
    next()
  } catch (error) {
    next(error)
  }
})

// ─── Calculate age from DOB ─────────────────────────────────
userSchema.pre('save', function (next) {
  if (this.dateOfBirth) {
    const today = new Date()
    let age = today.getFullYear() - this.dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      age--
    }
    this.age = age
  }
  next()
})

// ─── Compare password method ────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ─── Update trust score based on points ────────────────────
userSchema.methods.updateTrustScore = function () {
  const pts = this.trustPoints
  if (this.reportCount >= 3 || this.isBanned) {
    this.trustScore = 'risk'
  } else if (pts >= 30) {
    this.trustScore = 'trusted'
  } else if (pts >= 10) {
    this.trustScore = 'moderate'
  } else {
    this.trustScore = 'new'
  }
}

// ─── Generate 2FA tokens ────────────────────────────────────
userSchema.methods.generateTwoFactorSecret = function () {
  const speakeasy = require('speakeasy')
  const secret = speakeasy.generateSecret({
    name: `Blood Donation Network (${this.email})`,
    issuer: 'Blood Donation Network',
  })
  return secret
}

// ─── Custom JSON output ─────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.otp
  delete obj.twoFactorSecret
  delete obj.backupCodes
  delete obj.governmentIdNumber // Don't expose full ID
  delete obj.deviceFingerprints
  return obj
}

module.exports = mongoose.model('User', userSchema)
