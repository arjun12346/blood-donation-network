// ============================================================
// AI-Powered Emergency Blood Donation Network - Server
// Production-Grade Backend
// ============================================================
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const session = require('express-session')
const http = require('http')
const socketIo = require('socket.io')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const requestRoutes = require('./routes/requests')
const donorRoutes = require('./routes/donors')
const oauthRoutes = require('./routes/oauth')
const inventoryRoutes = require('./routes/inventory')
const emergencyAlertRoutes = require('./routes/emergencyAlerts')
const passport = require('./middleware/passport')

const app = express()
const server = http.createServer(app)

// ─── CORS Allowed Origins ─────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://blood-donation-web.onrender.com',
  'https://blood-donation-api.onrender.com',
]

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})

// Make io available globally
app.io = io

// ─── Security Middleware ──────────────────────────────────
app.use(helmet()) // Set security HTTP headers
app.use(mongoSanitize()) // Prevent NoSQL injection
app.use(compression()) // Compress responses

// ─── Session Configuration ────────────────────────────────
app.use(
  session({
    secret: process.env.JWT_SECRET || 'bloodnet_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
)

// ─── Passport Initialization ──────────────────────────────
app.use(passport.initialize())
app.use(passport.session())

// ─── CORS Configuration ───────────────────────────────────
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Body Parser Middleware ───────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Optimized Rate Limiter ───────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  skipSuccessfulRequests: true, // Don't count successful attempts
})

app.use('/api/', globalLimiter)

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/auth/oauth', authLimiter, oauthRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/emergency-alerts', emergencyAlertRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🩸 Blood Donation Network API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
  })
})

// ─── Socket.io Real-time Notifications ──────────────────
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`)

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`✅ User ${userId} joined room`)
  })

  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`)
  })
})

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  })
})

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack)

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production'
  const errorMessage = isProduction ? 'Internal server error' : err.message

  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { error: err.message, stack: err.stack }),
  })
})

// ─── Database Connection & Server Start ──────────────────
const connectAndStart = async () => {
  try {
    // ─── MongoDB Connection ──────────────────────────────
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation-prod'

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    })

    console.log('✅ MongoDB connected successfully')

    // ─── Skip Demo Data in Production ────────────────────
    if (process.env.NODE_ENV !== 'production') {
      console.log('💡 Tip: Demo data seeding is disabled in production mode')
    }

    // ─── Start Server ────────────────────────────────────
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🩸 Blood Donation Network API                            ║
║  🚀 Server running on http://localhost:${PORT}${' '.repeat(13)}║
║  📋 Health check: http://localhost:${PORT}/api/health${''.padEnd(8)}║
║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(34)}║
║  📦 Version: ${(process.env.APP_VERSION || '1.0.0').padEnd(39)}║
║  🔌 Real-time notifications: Enabled (Socket.io)         ║
╚════════════════════════════════════════════════════════════╝
      `)
    })

    // ─── Graceful Shutdown ───────────────────────────────
    process.on('SIGTERM', () => {
      console.log('📢 SIGTERM signal received: closing HTTP server')
      server.close(() => {
        console.log('✅ HTTP server closed')
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed')
          process.exit(0)
        })
      })
    })
  } catch (error) {
    console.error('❌ Startup error:', error.message)
    process.exit(1)
  }
}

connectAndStart()

module.exports = { app, server, io }
