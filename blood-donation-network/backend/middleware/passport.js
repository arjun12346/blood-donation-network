// ============================================================
// Passport Configuration - OAuth Strategies
// ============================================================
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const AppleStrategy = require('passport-apple').Strategy
const User = require('../models/User')

// ─── Google OAuth Strategy ────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0]?.value })

          if (!user) {
            user = new User({
              name: profile.displayName || profile.name?.familyName,
              email: profile.emails?.[0]?.value,
              phone: profile.phone || '',
              password: Math.random().toString(36).substring(2, 15), // Random password for OAuth
              bloodGroup: 'O+', // Default, can be updated later
              role: 'donor',
              dateOfBirth: new Date('1990-01-01'),
              country: { code: 'IN', name: 'India' },
              oauthProvider: 'google',
              oauthId: profile.id,
              emailVerified: true, // OAuth emails are pre-verified
              picture: profile.photos?.[0]?.value,
            })
            await user.save()
          }

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}

// ─── GitHub OAuth Strategy ────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0]?.value })

          if (!user) {
            user = new User({
              name: profile.displayName || profile.username,
              email: profile.emails?.[0]?.value,
              phone: profile.phone || '',
              password: Math.random().toString(36).substring(2, 15),
              bloodGroup: 'O+',
              role: 'donor',
              dateOfBirth: new Date('1990-01-01'),
              country: { code: 'IN', name: 'India' },
              oauthProvider: 'github',
              oauthId: profile.id,
              emailVerified: true,
              picture: profile.photos?.[0]?.value,
            })
            await user.save()
          }

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}

// ─── Apple OAuth Strategy ─────────────────────────────
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        callbackURL: process.env.APPLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, idToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.email })

          if (!user) {
            user = new User({
              name: profile.name?.firstName || 'Apple User',
              email: profile.email,
              phone: '',
              password: Math.random().toString(36).substring(2, 15),
              bloodGroup: 'O+',
              role: 'donor',
              dateOfBirth: new Date('1990-01-01'),
              country: { code: 'IN', name: 'India' },
              oauthProvider: 'apple',
              oauthId: profile.sub,
              emailVerified: true,
            })
            await user.save()
          }

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}

// ─── Serialize/Deserialize User ───────────────────────
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport
