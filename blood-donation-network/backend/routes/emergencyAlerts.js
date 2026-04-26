// ============================================================
// Emergency Alert Routes
// ============================================================
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const EmergencyAlert = require('../models/EmergencyAlert')
const User = require('../models/User')

// ─── Create Emergency Alert ────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      location,
      bloodRequirements,
      contactPersonName,
      contactPersonPhone,
    } = req.body

    if (!title || !description || !type || !location) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const alert = new EmergencyAlert({
      title,
      description,
      type,
      severity,
      location,
      bloodRequirements: bloodRequirements || [],
      createdBy: req.user._id,
      facility: req.user.facility,
      contactPersonName: contactPersonName || req.user.name,
      contactPersonPhone: contactPersonPhone || req.user.phone,
    })

    await alert.save()

    // Broadcast alert via Socket.io
    if (req.app.io) {
      req.app.io.emit('emergency-alert', {
        id: alert._id,
        title: alert.title,
        severity: alert.severity,
        location: alert.location,
      })
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert created successfully',
      data: alert,
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to create alert', error: error.message })
  }
})

// ─── Get Active Alerts ────────────────────────────────
router.get('/active', async (req, res) => {
  try {
    const alerts = await EmergencyAlert.findActiveAlerts()
      .populate('createdBy', 'name contactPhone')
      .sort({ severity: -1, createdAt: -1 })
      .limit(50)

    res.json({
      success: true,
      data: alerts.map((alert) => ({
        ...alert.toObject(),
        stats: alert.getStatistics(),
      })),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message })
  }
})

// ─── Get Nearby Alerts ────────────────────────────────
router.post('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radiusKm = 50 } = req.body

    const alerts = await EmergencyAlert.find({
      status: 'active',
      'location.lat': {
        $gte: lat - radiusKm / 111,
        $lte: lat + radiusKm / 111,
      },
      'location.lng': {
        $gte: lng - radiusKm / (111 * Math.cos((lat * Math.PI) / 180)),
        $lte: lng + radiusKm / (111 * Math.cos((lat * Math.PI) / 180)),
      },
    })
      .sort({ severity: -1, createdAt: -1 })
      .limit(20)

    res.json({
      success: true,
      data: alerts.map((alert) => ({
        ...alert.toObject(),
        stats: alert.getStatistics(),
      })),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch nearby alerts', error: error.message })
  }
})

// ─── Respond to Emergency Alert ────────────────────────
router.post('/:alertId/respond', protect, async (req, res) => {
  try {
    const { bloodGroup, unitsOffered, status = 'accepted' } = req.body

    const alert = await EmergencyAlert.findById(req.params.alertId)
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    const response = {
      respondent: req.user._id,
      respondentName: req.user.name,
      bloodGroup,
      unitsOffered,
      contact: req.user.phone,
      status,
      respondedAt: new Date(),
    }

    await alert.addResponse(response)

    // Notify alert creator
    if (req.app.io) {
      req.app.io.to(`user-${alert.createdBy}`).emit('alert-response', {
        alertId: alert._id,
        respondent: req.user.name,
        bloodGroup,
        units: unitsOffered,
      })
    }

    res.json({
      success: true,
      message: 'Response recorded successfully',
      data: alert,
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to respond', error: error.message })
  }
})

// ─── Get Alert Details ────────────────────────────────
router.get('/:alertId', async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId)
      .populate('createdBy', 'name contactPhone picture')
      .populate('responses.respondent', 'name picture')

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    res.json({
      success: true,
      data: {
        ...alert.toObject(),
        stats: alert.getStatistics(),
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alert', error: error.message })
  }
})

// ─── Resolve Alert ────────────────────────────────────
router.post('/:alertId/resolve', protect, async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId)

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    if (alert.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await alert.markResolved()

    // Notify subscribers
    if (req.app.io) {
      req.app.io.emit('alert-resolved', {
        alertId: alert._id,
        title: alert.title,
      })
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert,
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to resolve alert', error: error.message })
  }
})

module.exports = router
