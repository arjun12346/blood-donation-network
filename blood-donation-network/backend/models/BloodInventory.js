// ============================================================
// Blood Inventory Model - Hospital/Blood Bank Management
// ============================================================
const mongoose = require('mongoose')

const bloodInventorySchema = new mongoose.Schema(
  {
    // ─── Facility Information ──────────────────────────────
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    facilityName: {
      type: String,
      required: true,
    },
    facilityType: {
      type: String,
      enum: ['hospital', 'blood_bank', 'clinic', 'private_clinic'],
      required: true,
    },

    // ─── Blood Group Inventory ────────────────────────────
    bloodInventory: [
      {
        bloodGroup: {
          type: String,
          enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          required: true,
        },
        unitsAvailable: {
          type: Number,
          default: 0,
          min: 0,
        },
        unitsReserved: {
          type: Number,
          default: 0,
          min: 0,
        },
        minimumThreshold: {
          type: Number,
          default: 10,
        },
        criticalThreshold: {
          type: Number,
          default: 5,
        },
        lastRestockDate: Date,
        expiryDates: [
          {
            units: Number,
            expiryDate: Date,
          },
        ],
      },
    ],

    // ─── Usage & Activity ──────────────────────────────────
    totalRequestsFulfilled: {
      type: Number,
      default: 0,
    },
    totalUnitsDispensed: {
      type: Number,
      default: 0,
    },
    recentTransactions: [
      {
        type: String,
        date: { type: Date, default: Date.now },
        transactionType: {
          type: String,
          enum: ['donation', 'dispensed', 'expired', 'damaged', 'restock'],
        },
        bloodGroup: String,
        units: Number,
        notes: String,
      },
    ],

    // ─── Notifications & Alerts ────────────────────────────
    lowStockAlerts: {
      enabled: { type: Boolean, default: true },
      emails: [String],
      smsNumbers: [String],
    },
    criticalStockAlerts: {
      enabled: { type: Boolean, default: true },
      emails: [String],
      smsNumbers: [String],
    },
    expiryAlerts: {
      enabled: { type: Boolean, default: true },
      daysBeforeExpiry: { type: Number, default: 7 },
    },

    // ─── Status & Metadata ────────────────────────────────
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// ─── Indexes ────────────────────────────────────────────
bloodInventorySchema.index({ facilityId: 1 })
bloodInventorySchema.index({ 'bloodInventory.bloodGroup': 1 })
bloodInventorySchema.index({ isActive: 1 })

// ─── Methods ────────────────────────────────────────────
bloodInventorySchema.methods.getInventorySummary = function () {
  return {
    facility: this.facilityName,
    total: this.bloodInventory.reduce((sum, item) => sum + item.unitsAvailable, 0),
    byBloodGroup: this.bloodInventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      available: item.unitsAvailable,
      reserved: item.unitsReserved,
      threshold: item.minimumThreshold,
      status:
        item.unitsAvailable <= item.criticalThreshold
          ? 'CRITICAL'
          : item.unitsAvailable <= item.minimumThreshold
            ? 'LOW'
            : 'OK',
    })),
  }
}

bloodInventorySchema.methods.updateInventory = async function (bloodGroup, unitsChange, type) {
  const inventory = this.bloodInventory.find((inv) => inv.bloodGroup === bloodGroup)
  if (!inventory) throw new Error(`Blood group ${bloodGroup} not found`)

  inventory.unitsAvailable += unitsChange
  this.recentTransactions.push({
    type,
    date: new Date(),
    transactionType: type,
    bloodGroup,
    units: unitsChange,
  })

  return this.save()
}

bloodInventorySchema.methods.checkCriticalStock = function () {
  return this.bloodInventory.filter((inv) => inv.unitsAvailable <= inv.criticalThreshold)
}

bloodInventorySchema.methods.checkExpiringSoon = function (daysBeforeExpiry = 7) {
  const now = new Date()
  const expiryDate = new Date(now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000)

  return this.bloodInventory.flatMap((inv) =>
    inv.expiryDates
      .filter((exp) => exp.expiryDate <= expiryDate && exp.expiryDate >= now)
      .map((exp) => ({
        bloodGroup: inv.bloodGroup,
        units: exp.units,
        expiryDate: exp.expiryDate,
      }))
  )
}

module.exports = mongoose.model('BloodInventory', bloodInventorySchema)
