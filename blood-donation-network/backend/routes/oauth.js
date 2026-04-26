// ============================================================
// OAuth Routes - Google, GitHub, Apple Authentication
// ============================================================
const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()

// ─── OAuth Callbacks ───────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'bloodnet_secret', {
    expiresIn: '7d',
  })
}

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id)
    res.redirect(
      `${process.env.CLIENT_URL}/auth-success?token=${token}&user=${JSON.stringify(req.user)}`
    )
  }
)

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id)
    res.redirect(
      `${process.env.CLIENT_URL}/auth-success?token=${token}&user=${JSON.stringify(req.user)}`
    )
  }
)

// Apple OAuth
router.get('/apple', passport.authenticate('apple', { scope: ['name', 'email'] }))

router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id)
    res.redirect(
      `${process.env.CLIENT_URL}/auth-success?token=${token}&user=${JSON.stringify(req.user)}`
    )
  }
)

module.exports = router
