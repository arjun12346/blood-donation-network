// ============================================================
// Auth Controller - Register, Login, OTP, Profile
// ============================================================
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ─── Generate JWT Token ───────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'bloodnet_secret', { expiresIn: '7d' })
}

// ─── Generate Mock OTP ────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// ─── REGISTER ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, phone, password, bloodGroup, role, location, country } = req.body

    if (!name || !email || !phone || !password || !bloodGroup || !role || !country) {
      return res.status(400).json({ message: 'All fields are required including country.' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered. Please login.' })
    }

    // Generate OTP for verification
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      bloodGroup,
      role,
      location: location || { text: '', lat: null, lng: null },
      dateOfBirth: new Date('1990-01-01'),
      country: country,
      otp,
      otpExpiry,
    })

    user.updateTrustScore()
    await user.save()

    const token = generateToken(user._id)

    console.log(`📱 Mock OTP for ${email}: ${otp}`) // In production, send via SMS

    res.status(201).json({
      message: 'Registration successful! Please verify your OTP.',
      token,
      user: user.toJSON(),
      mockOtp: otp, // Only for demo/hackathon
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists.' })
    }
    res.status(500).json({ message: 'Registration failed.', error: error.message })
  }
}

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account banned due to suspicious activity.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Login successful!',
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message })
  }
}

// ─── VERIFY OTP ───────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const user = req.user

    if (!otp) return res.status(400).json({ message: 'OTP is required.' })

    if (user.otpVerified) {
      return res.json({ message: 'Already verified!', user: user.toJSON() })
    }

    const dbUser = await User.findById(user._id)
    if (dbUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }

    if (new Date() > dbUser.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    dbUser.otpVerified = true
    dbUser.isVerified = true
    dbUser.otp = null
    dbUser.otpExpiry = null
    dbUser.trustPoints += 10
    dbUser.updateTrustScore()
    await dbUser.save()

    res.json({
      message: '✅ Phone verified! You are now a verified user.',
      user: dbUser.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed.', error: error.message })
  }
}

// ─── RESEND OTP ───────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const otp = generateOTP()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    console.log(`📱 New Mock OTP for ${user.email}: ${otp}`)

    res.json({
      message: 'New OTP sent to your phone.',
      mockOtp: otp, // Demo only
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend OTP.', error: error.message })
  }
}

// ─── GET PROFILE ──────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: error.message })
  }
}

// ─── UPDATE PROFILE ───────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body
    const user = await User.findById(req.user._id)

    if (name) user.name = name
    if (phone) user.phone = phone
    if (location) user.location = location

    await user.save()
    res.json({ message: 'Profile updated!', user: user.toJSON() })
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed.', error: error.message })
  }
}

// ─── MARK DONATION SUCCESS ────────────────────────────────
const markDonationSuccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.successfulDonations += 1
    user.trustPoints += 20
    user.updateTrustScore()
    user.notifications.push({
      message: `🎉 Thank you for your donation! Trust score updated.`,
      type: 'success',
    })
    await user.save()
    res.json({
      message: 'Donation recorded! Trust score updated.',
      trustScore: user.trustScore,
      trustPoints: user.trustPoints,
      successfulDonations: user.successfulDonations,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to record donation.', error: error.message })
  }
}

// ─── GET NOTIFICATIONS ────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications')
    const notifs = user.notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20)
    res.json({ notifications: notifs })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.' })
  }
}

// ─── MARK NOTIFICATIONS READ ─────────────────────────────
const markNotificationsRead = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true },
    })
    res.json({ message: 'Notifications marked as read.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications.' })
  }
}

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  markDonationSuccess,
  getNotifications,
  markNotificationsRead,
}
