// ============================================================
// Advanced Fraud Detection Service
// ML-Ready Fraud Detection & Fake Request Detection
// ============================================================

class FraudDetectionService {
  constructor() {
    this.fraudThreshold = parseFloat(process.env.FRAUD_DETECTION_THRESHOLD) || 0.75
    this.mlApiEndpoint = process.env.ML_API_ENDPOINT
    this.mlApiKey = process.env.ML_API_KEY
  }

  /**
   * Comprehensive fraud score calculation
   * @param {object} user - User document
   * @param {object} request - Blood request data
   * @param {string} message - Request message
   * @returns {Promise<object>} - Fraud analysis result
   */
  async analyzeRequest(user, request, message) {
    const scores = {
      userBehavior: await this.analyzeUserBehavior(user),
      messageAnalysis: this.analyzeMessageContent(message, user),
      patternDetection: await this.detectAnomalousPatterns(user, request),
      deviceFingerprint: await this.analyzeDeviceFingerprint(request),
      geolocation: await this.analyzeGeolocation(user, request),
    }

    const overallScore = this.calculateOverallScore(scores)
    const riskLevel = this.determineRiskLevel(overallScore)
    const reasons = this.generateReasons(scores)

    // Call ML API if available
    let mlScore = null
    if (this.mlApiEndpoint) {
      mlScore = await this.callMLAPI({
        user: user,
        request: request,
        message: message,
        scores: scores,
      })
    }

    return {
      overallScore: overallScore,
      mlScore: mlScore,
      riskLevel: riskLevel,
      confidence: this.calculateConfidence(scores),
      reasons: reasons,
      detailedScores: scores,
      isFraud: overallScore > this.fraudThreshold,
      recommendedAction: this.getRecommendedAction(overallScore, mlScore),
    }
  }

  /**
   * Analyze user behavior pattern
   */
  async analyzeUserBehavior(user) {
    let score = 0
    const factors = []

    // Account age factor
    const accountAgeMs = Date.now() - new Date(user.createdAt).getTime()
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24)
    if (accountAgeDays < 1) {
      score += 0.3 // New account
      factors.push('Very new account (< 1 day)')
    } else if (accountAgeDays < 7) {
      score += 0.15
      factors.push('New account (< 7 days)')
    }

    // Verification status
    if (!user.isVerified || !user.otpVerified) {
      score += 0.2
      factors.push('Unverified user')
    }

    // Previous donations/requests
    const activityScore = user.successfulDonations / (user.requestCount + 1)
    if (activityScore < 0.2) {
      score += 0.15
      factors.push('Low donation-to-request ratio')
    }

    // Trust score
    if (user.trustScore === 'risk') {
      score += 0.3
      factors.push('High-risk user flag')
    } else if (user.trustScore === 'trusted') {
      score -= 0.2
      factors.push('Trusted user (reduced risk)')
    }

    // Report history
    if (user.reportCount >= 5) {
      score += 0.4
      factors.push('Multiple reports on account')
    } else if (user.reportCount >= 2) {
      score += 0.2
      factors.push('Prior reports on account')
    }

    // Ban status
    if (user.isBanned) {
      score += 0.5
      factors.push('Account banned or suspended')
    }

    // Request frequency
    if (user.lastRequestTime) {
      const timeSinceLastRequest = Date.now() - new Date(user.lastRequestTime).getTime()
      const hoursSince = timeSinceLastRequest / (1000 * 60 * 60)

      if (hoursSince < 1 && user.requestCount >= 2) {
        score += 0.25
        factors.push('Multiple requests within 1 hour')
      }
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
    }
  }

  /**
   * Analyze message for fraud indicators
   */
  analyzeMessageContent(message, user) {
    let score = 0
    const factors = []
    const text = message.toLowerCase().trim()

    // Spam patterns
    const spamPatterns = [
      /(\bpls\b|\bplz\b).*(\bfast\b|\bquick\b)/gi,
      /\b(urgent|emergency|critical)\b.*\b(urgent|emergency|critical)\b/gi,
      /!!!+/g,
      /\bhelp\b.*\bhelp\b.*\bhelp\b/gi,
      /money|pay|cash|reward|transfer|upi|wallet/gi,
    ]

    spamPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        score += 0.15
        factors.push('Spam-like pattern detected')
      }
    })

    // Excessive punctuation
    const exclamations = (message.match(/!/g) || []).length
    const questions = (message.match(/\?/g) || []).length
    if (exclamations > 5 || questions > 5) {
      score += 0.1
      factors.push('Excessive punctuation')
    }

    // Excessive capitalization
    const capsCount = (message.match(/[A-Z]/g) || []).length
    const capsRatio = capsCount / Math.max(message.length, 1)
    if (capsRatio > 0.5 && message.length > 20) {
      score += 0.1
      factors.push('Excessive capitalization (shouting)')
    }

    // Message length check
    if (message.length < 15) {
      score += 0.1
      factors.push('Message too short/vague')
    }

    // New user + urgent language
    const urgentKeywords = [
      'urgent',
      'immediately',
      'right now',
      'dying',
      'critical',
      'asap',
      'emergency',
    ]
    const hasUrgent = urgentKeywords.some((w) => text.includes(w))
    if (hasUrgent && user.trustScore === 'new') {
      score += 0.15
      factors.push('New user with urgent language')
    }

    // Keyword analysis
    const suspiciousKeywords = ['scam', 'fake', 'money', 'transfer', 'business', 'opportunity']
    if (suspiciousKeywords.some((w) => text.includes(w))) {
      score += 0.2
      factors.push('Suspicious keywords detected')
    }

    // Legitimate blood medical keywords
    const legitimateKeywords = [
      'surgery',
      'hospital',
      'doctor',
      'patient',
      'accident',
      'emergency',
      'medical',
      'condition',
    ]
    const legitimateScore =
      legitimateKeywords.filter((w) => text.includes(w)).length / legitimateKeywords.length
    if (legitimateScore > 0.3) {
      score -= 0.15
      factors.push('Medical context keywords present')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
      messageLength: message.length,
      urgencyLevel: hasUrgent ? 'high' : 'normal',
    }
  }

  /**
   * Detect anomalous patterns
   */
  async detectAnomalousPatterns(user, request) {
    let score = 0
    const factors = []

    // Same blood type matching (suspicious if always matching)
    if (request.bloodGroup === user.bloodGroup) {
      score += 0.1
      factors.push('Matching blood type with own')
    }

    // Location jumps (impossible distances in short time)
    if (user.lastLocation && request.location) {
      const distance = this.calculateDistance(user.lastLocation, request.location)
      const timeSinceLastRequest = user.lastRequestTime
        ? (Date.now() - new Date(user.lastRequestTime).getTime()) / (1000 * 60)
        : Infinity

      const speedMph = (distance / timeSinceLastRequest) * 60
      if (speedMph > 500) {
        // Impossible speed
        score += 0.3
        factors.push('Impossible travel distance detected')
      }
    }

    // Request frequency spike
    if (user.requestCount > 3) {
      score += 0.15
      factors.push('High request frequency')
    }

    // Role consistency (requesting as donor, posting as receiver, etc)
    if (user.role === 'donor' && request.role === 'receiver') {
      score += 0.2
      factors.push('Role inconsistency detected')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
    }
  }

  /**
   * Analyze device fingerprint
   */
  async analyzeDeviceFingerprint(request) {
    let score = 0
    const factors = []

    if (!request.deviceFingerprint) {
      score += 0.05
      factors.push('No device fingerprint provided')
      return { score, factors }
    }

    // Check for device inconsistencies
    if (request.userAgent && request.ipAddress) {
      // Could check against known VPN/Proxy lists
      score += 0
      factors.push('Device fingerprint verified')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
    }
  }

  /**
   * Analyze geolocation
   */
  async analyzeGeolocation(user, request) {
    let score = 0
    const factors = []

    if (!user.location || !request.location) {
      score += 0.05
      factors.push('Missing location data')
      return { score, factors }
    }

    const distance = this.calculateDistance(user.location, request.location)
    if (distance > 100) {
      // More than 100km from user
      score += 0.1
      factors.push('Request far from user location')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
    }
  }

  /**
   * Call ML API for advanced fraud detection
   */
  async callMLAPI(data) {
    try {
      if (!this.mlApiEndpoint || !this.mlApiKey) return null

      const response = await fetch(this.mlApiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.mlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        return result.score
      }
      return null
    } catch (error) {
      console.error('ML API Error:', error)
      return null
    }
  }

  /**
   * Calculate overall fraud score
   */
  calculateOverallScore(scores) {
    const weights = {
      userBehavior: 0.35,
      messageAnalysis: 0.3,
      patternDetection: 0.2,
      deviceFingerprint: 0.1,
      geolocation: 0.05,
    }

    let totalScore = 0
    Object.keys(scores).forEach((key) => {
      if (scores[key] && scores[key].score !== undefined) {
        totalScore += scores[key].score * (weights[key] || 0)
      }
    })

    return Math.max(0, Math.min(1, totalScore))
  }

  /**
   * Determine risk level
   */
  determineRiskLevel(score) {
    if (score > 0.85) return 'CRITICAL'
    if (score > 0.7) return 'HIGH'
    if (score > 0.5) return 'MEDIUM'
    if (score > 0.25) return 'LOW'
    return 'SAFE'
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(scores) {
    let confidence = 0
    Object.values(scores).forEach((score) => {
      if (score && score.factors && score.factors.length > 0) {
        confidence += 0.2
      }
    })
    return Math.min(1, confidence)
  }

  /**
   * Generate human-readable reasons
   */
  generateReasons(scores) {
    const reasons = []
    Object.values(scores).forEach((score) => {
      if (score && score.factors) {
        reasons.push(...score.factors)
      }
    })
    return [...new Set(reasons)] // Remove duplicates
  }

  /**
   * Get recommended action
   */
  getRecommendedAction(score, mlScore) {
    const finalScore = mlScore || score

    if (finalScore > 0.9) return 'AUTO_REJECT'
    if (finalScore > 0.7) return 'MANUAL_REVIEW'
    if (finalScore > 0.5) return 'FLAG_FOR_VERIFICATION'
    return 'APPROVE'
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1, coord2) {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(coord2.lat - coord1.lat)
    const dLng = this.toRad(coord2.lng - coord1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRad(deg) {
    return deg * (Math.PI / 180)
  }
}

module.exports = new FraudDetectionService()
