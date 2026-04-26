// ============================================================
// Donors Controller - List donors, search, etc.
// ============================================================
const User = require('../models/User');

// ─── GET ALL DONORS ───────────────────────────────────────
const getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, location, page = 1, limit = 20 } = req.query;

    const filter = { role: 'donor', isBanned: false };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (location) filter['location.text'] = { $regex: location, $options: 'i' };

    const donors = await User.find(filter)
      .select('name bloodGroup location trustScore isVerified successfulDonations createdAt')
      .sort({ trustPoints: -1, successfulDonations: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({ donors, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donors.', error: error.message });
  }
};

// ─── GET DONOR LEADERBOARD ────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor', isBanned: false })
      .select('name bloodGroup trustScore isVerified successfulDonations trustPoints location')
      .sort({ successfulDonations: -1, trustPoints: -1 })
      .limit(10);

    res.json({ leaderboard: donors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard.', error: error.message });
  }
};

module.exports = { getAllDonors, getLeaderboard };
