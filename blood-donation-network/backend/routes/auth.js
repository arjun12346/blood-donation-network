// ============================================================
// Auth Routes
// ============================================================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  markDonationSuccess,
  getNotifications,
  markNotificationsRead,
} = require('../controllers/authController');

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth requests. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', protect, verifyOTP);
router.post('/resend-otp', protect, resendOTP);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/donation-success', protect, markDonationSuccess);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
