// ============================================================
// Donor Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { getAllDonors, getLeaderboard } = require('../controllers/donorController');

router.get('/', getAllDonors);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
