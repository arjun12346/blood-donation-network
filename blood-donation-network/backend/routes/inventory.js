// ============================================================
// Blood Inventory Routes
// ============================================================
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const BloodInventory = require('../models/BloodInventory')

// ─── Get Inventory Summary ─────────────────────────────
router.get('/summary/:facilityId', protect, async (req, res) => {
  try {
    const inventory = await BloodInventory.findOne({
      facilityId: req.params.facilityId,
      isActive: true,
    })

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }

    res.json({
      success: true,
      data: inventory.getInventorySummary(),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to get inventory summary', error: error.message })
  }
})

// ─── Get All Critical Stock ────────────────────────────
router.get('/critical/:facilityId', protect, async (req, res) => {
  try {
    const inventory = await BloodInventory.findOne({
      facilityId: req.params.facilityId,
      isActive: true,
    })

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }

    const critical = inventory.checkCriticalStock()
    res.json({
      success: true,
      data: critical,
      hasAlert: critical.length > 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to check critical stock', error: error.message })
  }
})

// ─── Get Expiring Soon ─────────────────────────────────
router.get('/expiring/:facilityId', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7
    const inventory = await BloodInventory.findOne({
      facilityId: req.params.facilityId,
      isActive: true,
    })

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }

    const expiring = inventory.checkExpiringSoon(days)
    res.json({
      success: true,
      data: expiring,
      hasAlert: expiring.length > 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to check expiring stock', error: error.message })
  }
})

// ─── Update Inventory ─────────────────────────────────
router.post('/update/:facilityId', protect, async (req, res) => {
  try {
    const { bloodGroup, units, type } = req.body

    if (!bloodGroup || !units || !type) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const inventory = await BloodInventory.findOne({
      facilityId: req.params.facilityId,
      isActive: true,
    })

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }

    await inventory.updateInventory(bloodGroup, units, type)

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory.getInventorySummary(),
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to update inventory', error: error.message })
  }
})

// ─── Search Nearby Blood ───────────────────────────────
router.post('/search', protect, async (req, res) => {
  try {
    const { bloodGroup, lat, lng, radiusKm = 10 } = req.body

    // Find blood inventories within radius
    const inventories = await BloodInventory.find({
      isActive: true,
      'bloodInventory.bloodGroup': bloodGroup,
      'bloodInventory.unitsAvailable': { $gt: 0 },
    }).populate('facilityId', 'name location contactPhone')

    const nearby = inventories.filter((inv) => {
      const dist = calculateDistance(
        lat,
        lng,
        inv.facilityId.location.lat,
        inv.facilityId.location.lng
      )
      return dist <= radiusKm
    })

    res.json({
      success: true,
      data: nearby.map((inv) => inv.getInventorySummary()),
    })
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message })
  }
})

// ─── Helper Function ──────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

module.exports = router
