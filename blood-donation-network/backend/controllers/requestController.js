// ============================================================
// Blood Request Controller - CRUD + AI Analysis
// ============================================================
const BloodRequest = require('../models/BloodRequest')
const User = require('../models/User')
const { analyzeRequest } = require('../utils/aiEngine')

// ─── CREATE REQUEST ───────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { bloodGroup, message, location, unitsNeeded, patientName } = req.body
    const user = req.user

    if (!bloodGroup || !message || !location?.text) {
      return res.status(400).json({ message: 'Blood group, message, and location are required.' })
    }

    // Check if user already has 2 active requests (spam prevention)
    const activeRequests = await BloodRequest.countDocuments({
      requester: user._id,
      status: 'active',
    })
    if (activeRequests >= 2) {
      return res.status(429).json({
        message: 'You already have 2 active requests. Please wait for them to be fulfilled.',
      })
    }

    // Count recent requests in last hour (rate limiting)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentRequestCount = await BloodRequest.countDocuments({
      requester: user._id,
      createdAt: { $gte: oneHourAgo },
    })

    // Run AI analysis
    const aiResult = analyzeRequest(message, user, recentRequestCount, location.text)

    // Update user request tracking
    const dbUser = await User.findById(user._id)
    dbUser.requestCount += 1
    dbUser.lastRequestTime = new Date()
    await dbUser.save()

    // Create the request
    const bloodRequest = new BloodRequest({
      requester: user._id,
      name: user.name,
      phone: user.phone,
      bloodGroup,
      message,
      location,
      unitsNeeded: unitsNeeded || 1,
      patientName: patientName || user.name,
      trustScore: user.trustScore,
      // AI results
      priorityLevel: aiResult.priorityLevel,
      priorityReason: aiResult.priorityReason,
      riskLevel: aiResult.riskLevel,
      riskReason: aiResult.riskReason,
      nearestHospital: aiResult.nearestHospital,
    })

    await bloodRequest.save()

    // Notify donors with matching blood group (mock notification via DB)
    const matchingDonors = await User.find({
      role: 'donor',
      bloodGroup: bloodGroup,
      _id: { $ne: user._id },
    }).limit(10)

    for (const donor of matchingDonors) {
      donor.notifications.push({
        message: `🩸 New ${bloodGroup} blood request near ${location.text}. Priority: ${aiResult.priorityLevel}`,
        type:
          aiResult.priorityLevel === 'HIGH'
            ? 'danger'
            : aiResult.priorityLevel === 'MEDIUM'
              ? 'warning'
              : 'info',
      })
      await donor.save()
    }

    res.status(201).json({
      message: 'Blood request created successfully!',
      request: bloodRequest,
      aiAnalysis: {
        priorityLevel: aiResult.priorityLevel,
        priorityReason: aiResult.priorityReason,
        riskLevel: aiResult.riskLevel,
        riskReason: aiResult.riskReason,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create request.', error: error.message })
  }
}

// ─── GET ALL REQUESTS ─────────────────────────────────────
const getAllRequests = async (req, res) => {
  try {
    const { bloodGroup, location, sort = 'priority', page = 1, limit = 20 } = req.query

    const filter = { isActive: true, status: 'active' }
    if (bloodGroup) filter.bloodGroup = bloodGroup
    if (location) filter['location.text'] = { $regex: location, $options: 'i' }

    let sortOption = {}
    if (sort === 'priority') {
      sortOption = { priorityOrder: -1, createdAt: -1 }
    } else if (sort === 'trust') {
      sortOption = { trustOrder: -1, createdAt: -1 }
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 }
    }

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name trustScore isVerified')
      .lean()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    // Add priority and trust order for sorting
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const trustOrder = { trusted: 3, moderate: 2, new: 1, risk: 0 }

    const sortedRequests = requests
      .map((r) => ({
        ...r,
        priorityOrder: priorityOrder[r.priorityLevel] || 1,
        trustOrder: trustOrder[r.trustScore] || 1,
        // Hide phone if HIGH RISK
        phone: r.riskLevel === 'HIGH' ? '**Hidden (High Risk)**' : r.phone,
      }))
      .sort((a, b) => {
        if (sort === 'priority')
          return b.priorityOrder - a.priorityOrder || new Date(b.createdAt) - new Date(a.createdAt)
        if (sort === 'trust')
          return b.trustOrder - a.trustOrder || new Date(b.createdAt) - new Date(a.createdAt)
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

    const total = await BloodRequest.countDocuments(filter)

    res.json({
      requests: sortedRequests,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: error.message })
  }
}

// ─── GET SINGLE REQUEST ───────────────────────────────────
const getRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate(
      'requester',
      'name email trustScore isVerified successfulDonations'
    )
    if (!request) return res.status(404).json({ message: 'Request not found.' })
    res.json({ request })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch request.', error: error.message })
  }
}

// ─── MY REQUESTS ──────────────────────────────────────────
const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user._id }).sort({ createdAt: -1 })
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your requests.', error: error.message })
  }
}

// ─── UPDATE REQUEST ───────────────────────────────────────
const updateRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
    })
    if (!request) return res.status(404).json({ message: 'Request not found or unauthorized.' })

    const { status, message, location } = req.body
    if (status) request.status = status
    if (message) request.message = message
    if (location) request.location = location
    if (status === 'fulfilled' || status === 'expired') request.isActive = false

    await request.save()
    res.json({ message: 'Request updated.', request })
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message })
  }
}

// ─── MARK FULFILLED ───────────────────────────────────────
const markFulfilled = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
    })
    if (!request) return res.status(404).json({ message: 'Not found.' })

    request.status = 'fulfilled'
    request.isActive = false
    await request.save()

    res.json({ message: '✅ Request marked as fulfilled. Thank you!', request })
  } catch (error) {
    res.status(500).json({ message: 'Failed.', error: error.message })
  }
}

// ─── REPORT REQUEST ───────────────────────────────────────
const reportRequest = async (req, res) => {
  try {
    const { reason } = req.body
    const request = await BloodRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found.' })

    // Prevent duplicate reports from same user
    if (request.reportedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already reported this request.' })
    }

    request.reportedBy.push(req.user._id)
    request.reportCount += 1

    // Auto-flag if 3+ reports
    if (request.reportCount >= 3) {
      request.status = 'flagged'
      request.isActive = false
      request.riskLevel = 'HIGH'

      // Update requester trust score
      const requester = await User.findById(request.requester)
      if (requester) {
        requester.reportCount += 1
        requester.trustPoints -= 10
        requester.updateTrustScore()
        requester.notifications.push({
          message: '⚠️ Your blood request has been flagged for suspicious activity.',
          type: 'danger',
        })
        await requester.save()
      }
    }

    await request.save()
    res.json({ message: 'Report submitted. Thank you for keeping the community safe.' })
  } catch (error) {
    res.status(500).json({ message: 'Report failed.', error: error.message })
  }
}

// ─── RESPOND TO REQUEST (Donor) ───────────────────────────
const respondToRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found.' })

    const alreadyResponded = request.respondedDonors.some(
      (d) => d.donorId?.toString() === req.user._id.toString()
    )
    if (!alreadyResponded) {
      request.respondedDonors.push({
        donorId: req.user._id,
        responseTime: new Date(),
        status: 'interested',
        updatedAt: new Date(),
      })
      await request.save()
    }

    // Notify the requester
    const requester = await User.findById(request.requester)
    if (requester) {
      requester.notifications.push({
        message: `🩸 ${req.user.name} has responded to your ${request.bloodGroup} blood request!`,
        type: 'success',
      })
      await requester.save()
    }

    // Update donor trust points
    const donor = await User.findById(req.user._id)
    donor.trustPoints += 5
    donor.updateTrustScore()
    await donor.save()

    res.json({ message: 'Response recorded! The requester has been notified.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond.', error: error.message })
  }
}

// ─── STATS / ANALYTICS ────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [total, active, fulfilled, highPriority, donors, receivers] = await Promise.all([
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'active' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      BloodRequest.countDocuments({ priorityLevel: 'HIGH', status: 'active' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'receiver' }),
    ])

    const bloodGroupStats = await BloodRequest.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    res.json({
      total,
      active,
      fulfilled,
      highPriority,
      donors,
      receivers,
      bloodGroupStats,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: error.message })
  }
}

module.exports = {
  createRequest,
  getAllRequests,
  getRequest,
  getMyRequests,
  updateRequest,
  markFulfilled,
  reportRequest,
  respondToRequest,
  getStats,
}
