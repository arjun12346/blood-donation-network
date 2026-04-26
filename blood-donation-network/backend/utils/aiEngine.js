// ============================================================
// AI Engine - Fake Detection & Urgency Classification
// Simple logic-based classification (hackathon-ready)
// ============================================================

/**
 * FAKE DETECTION SYSTEM
 * Classifies requests as SAFE 🟢 / MEDIUM 🟡 / HIGH RISK 🔴
 */
const detectFakeRequest = (message, user, recentRequestCount = 0) => {
  const reasons = [];
  let score = 0; // higher = more risky

  const text = message.toLowerCase().trim();

  // ── Rule 1: Spam / repeated words ────────────────────────
  const spamPatterns = [
    /urgent\s+urgent/gi,
    /pls\s+fast/gi,
    /plz\s+fast/gi,
    /help\s+help\s+help/gi,
    /emergency\s+emergency/gi,
    /fast\s+fast/gi,
    /please\s+please\s+please/gi,
  ];
  spamPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      score += 25;
      reasons.push('Repeated urgent keywords detected (spam-like pattern)');
    }
  });

  // ── Rule 2: Excessive punctuation / caps ─────────────────
  const exclamationCount = (message.match(/!/g) || []).length;
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (exclamationCount > 4) {
    score += 15;
    reasons.push('Excessive exclamation marks');
  }
  if (capsRatio > 0.6 && message.length > 10) {
    score += 15;
    reasons.push('Excessive capitalization (shouting pattern)');
  }

  // ── Rule 3: New user + urgent language ───────────────────
  const urgentWords = ['urgent', 'immediately', 'right now', 'dying', 'critical', 'asap'];
  const hasUrgentWord = urgentWords.some((w) => text.includes(w));
  const isNewUser = user?.trustScore === 'new' || !user;
  if (isNewUser && hasUrgentWord) {
    score += 20;
    reasons.push('New/unverified user with urgent language');
  }

  // ── Rule 4: Too many requests in short time ───────────────
  if (recentRequestCount >= 3) {
    score += 35;
    reasons.push('Multiple requests submitted in a short period');
  } else if (recentRequestCount === 2) {
    score += 15;
    reasons.push('Multiple recent requests from same account');
  }

  // ── Rule 5: Very short / meaningless message ─────────────
  if (message.trim().length < 15) {
    score += 20;
    reasons.push('Request message too short or vague');
  }

  // ── Rule 6: Suspicious phone / money-related words ───────
  const suspiciousWords = ['money', 'pay', 'cash', 'reward', 'transfer', 'upi', 'wallet'];
  if (suspiciousWords.some((w) => text.includes(w))) {
    score += 30;
    reasons.push('Money-related keywords detected');
  }

  // ── Rule 7: Known risk user ──────────────────────────────
  if (user?.trustScore === 'risk' || user?.reportCount >= 3) {
    score += 40;
    reasons.push('User has prior reports / risk flag');
  }

  // ── Bonus: Verified user trust ───────────────────────────
  if (user?.isVerified || user?.trustScore === 'trusted') {
    score -= 15;
    reasons.push('Verified/trusted user (risk reduced)');
  }

  // ── Classify ──────────────────────────────────────────────
  let riskLevel;
  if (score >= 50) {
    riskLevel = 'HIGH';
  } else if (score >= 20) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'SAFE';
  }

  return {
    riskLevel,
    riskScore: Math.max(0, Math.min(100, score)),
    reason: reasons.length > 0 ? reasons.join('; ') : 'No suspicious patterns detected',
    reasons,
  };
};

/**
 * URGENCY DETECTION SYSTEM
 * Classifies urgency as HIGH 🔴 / MEDIUM 🟡 / LOW 🟢
 */
const detectUrgency = (message) => {
  const text = message.toLowerCase().trim();
  const reasons = [];
  let urgencyScore = 0;

  // ── HIGH urgency keywords ────────────────────────────────
  const highKeywords = [
    { word: 'accident', weight: 40 },
    { word: 'icu', weight: 45 },
    { word: 'intensive care', weight: 45 },
    { word: 'emergency', weight: 35 },
    { word: 'surgery', weight: 35 },
    { word: 'operation', weight: 30 },
    { word: 'heavy bleeding', weight: 50 },
    { word: 'bleeding', weight: 30 },
    { word: 'critical', weight: 40 },
    { word: 'life or death', weight: 50 },
    { word: 'dying', weight: 50 },
    { word: 'immediate', weight: 30 },
    { word: 'right now', weight: 30 },
    { word: 'trauma', weight: 35 },
    { word: 'unconscious', weight: 40 },
    { word: 'coma', weight: 45 },
    { word: 'hemorrhage', weight: 45 },
    { word: 'liver failure', weight: 45 },
    { word: 'kidney failure', weight: 40 },
    { word: 'organ failure', weight: 45 },
    { word: 'heart attack', weight: 45 },
    { word: 'stroke', weight: 40 },
    { word: 'cancer', weight: 35 },
    { word: 'chemotherapy', weight: 35 },
    { word: 'transfusion', weight: 30 },
  ];

  // ── MEDIUM urgency keywords ──────────────────────────────
  const mediumKeywords = [
    { word: 'hospitalized', weight: 20 },
    { word: 'hospital', weight: 15 },
    { word: 'admitted', weight: 20 },
    { word: 'needed today', weight: 25 },
    { word: 'today', weight: 15 },
    { word: 'urgent', weight: 20 },
    { word: 'urgently', weight: 20 },
    { word: 'soon', weight: 10 },
    { word: 'patient', weight: 10 },
    { word: 'anaemia', weight: 15 },
    { word: 'anemia', weight: 15 },
    { word: 'scheduled', weight: 10 },
    { word: 'doctor advised', weight: 15 },
  ];

  // ── LOW urgency keywords ─────────────────────────────────
  const lowKeywords = [
    { word: 'tomorrow', weight: -5 },
    { word: 'next week', weight: -10 },
    { word: 'routine', weight: -10 },
    { word: 'planned', weight: -5 },
    { word: 'when available', weight: -5 },
    { word: 'elective', weight: -10 },
  ];

  highKeywords.forEach(({ word, weight }) => {
    if (text.includes(word)) {
      urgencyScore += weight;
      reasons.push(`High urgency indicator: "${word}"`);
    }
  });

  mediumKeywords.forEach(({ word, weight }) => {
    if (text.includes(word)) {
      urgencyScore += weight;
      reasons.push(`Medium urgency indicator: "${word}"`);
    }
  });

  lowKeywords.forEach(({ word, weight }) => {
    if (text.includes(word)) {
      urgencyScore += weight;
    }
  });

  // ── Classify ──────────────────────────────────────────────
  let priorityLevel;
  if (urgencyScore >= 35) {
    priorityLevel = 'HIGH';
  } else if (urgencyScore >= 15) {
    priorityLevel = 'MEDIUM';
  } else {
    priorityLevel = 'LOW';
  }

  return {
    priorityLevel,
    urgencyScore: Math.max(0, urgencyScore),
    reason:
      reasons.length > 0
        ? reasons.slice(0, 3).join('; ')
        : 'No specific urgency indicators found',
    reasons,
  };
};

/**
 * NEAREST HOSPITAL MOCK
 * Returns a mock nearby hospital based on location text
 */
const getNearestHospital = (locationText = '') => {
  const hospitals = [
    { name: 'AIIMS Hospital', distance: '1.2 km' },
    { name: 'Apollo Hospital', distance: '2.3 km' },
    { name: 'Fortis Hospital', distance: '3.1 km' },
    { name: 'Max Super Specialty Hospital', distance: '4.5 km' },
    { name: 'Medanta - The Medicity', distance: '5.7 km' },
    { name: 'Manipal Hospital', distance: '2.8 km' },
    { name: 'Narayana Health', distance: '3.6 km' },
    { name: 'Columbia Asia Hospital', distance: '1.9 km' },
    { name: 'Lilavati Hospital', distance: '2.2 km' },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', distance: '6.1 km' },
    { name: 'PGIMER Hospital', distance: '1.5 km' },
    { name: 'Safdarjung Hospital', distance: '2.0 km' },
    { name: 'Lady Hardinge Medical College', distance: '3.3 km' },
    { name: 'RML Hospital', distance: '2.7 km' },
    { name: 'Indira Gandhi Hospital', distance: '4.1 km' },
  ];

  // Deterministic based on location string length
  const idx = (locationText.length % hospitals.length);
  return hospitals[idx];
};

/**
 * COMBINED AI ANALYSIS
 * Run all AI checks and return combined result
 */
const analyzeRequest = (message, user, recentRequestCount = 0, locationText = '') => {
  const fakeResult = detectFakeRequest(message, user, recentRequestCount);
  const urgencyResult = detectUrgency(message);
  const hospital = getNearestHospital(locationText);

  return {
    riskLevel: fakeResult.riskLevel,
    riskScore: fakeResult.riskScore,
    riskReason: fakeResult.reason,
    priorityLevel: urgencyResult.priorityLevel,
    urgencyScore: urgencyResult.urgencyScore,
    priorityReason: urgencyResult.reason,
    nearestHospital: hospital,
  };
};

module.exports = { detectFakeRequest, detectUrgency, getNearestHospital, analyzeRequest };
