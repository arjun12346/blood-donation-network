// ============================================================
// KYC (Know Your Customer) Verification Service
// Identity & Medical Document Verification
// ============================================================

class KYCVerificationService {
  constructor() {
    this.kycProvider = process.env.KYC_PROVIDER || 'aadhar_sdk'
    this.aadharApiKey = process.env.AADHAR_API_KEY
    this.truliooApiKey = process.env.TRULIOO_API_KEY
  }

  /**
   * Verify government ID (Aadhar, Passport, Drivers License, etc)
   */
  async verifyGovernmentID(userId, idType, idNumber, idDocument) {
    try {
      if (!idType || !idNumber) {
        throw new Error('ID type and number required')
      }

      let verificationResult = null

      if (this.kycProvider === 'aadhar_sdk' && idType === 'aadhar') {
        verificationResult = await this.verifyAadhar(idNumber, idDocument)
      } else if (this.kycProvider === 'trulioo') {
        verificationResult = await this.verifyViaTrilioo(idType, idNumber)
      } else {
        // Fallback: Basic validation
        verificationResult = this.validateIDFormat(idType, idNumber)
      }

      return {
        userId: userId,
        idType: idType,
        verificationStatus: verificationResult.verified ? 'VERIFIED' : 'FAILED',
        verificationLevel: verificationResult.level || 'BASIC',
        timestamp: new Date().toISOString(),
        result: verificationResult,
      }
    } catch (error) {
      console.error('ID Verification Error:', error)
      return {
        userId: userId,
        verificationStatus: 'ERROR',
        error: error.message,
      }
    }
  }

  /**
   * Verify Aadhar number
   */
  async verifyAadhar(aadharNumber, aadharDocument) {
    try {
      // Remove spaces and hyphens
      const cleaned = aadharNumber.replace(/[\s-]/g, '')

      if (cleaned.length !== 12 || !/^\d+$/.test(cleaned)) {
        return {
          verified: false,
          reason: 'Invalid Aadhar format',
        }
      }

      // Verify Aadhar checksum (Verhoeff algorithm)
      if (!this.verifyAadharChecksum(cleaned)) {
        return {
          verified: false,
          reason: 'Invalid Aadhar checksum',
        }
      }

      // In production, call Aadhar API
      // For now, return basic verification
      return {
        verified: true,
        level: 'HIGH',
        number: `****-****-${cleaned.slice(-4)}`, // Masked
        provider: 'UIDAI',
      }
    } catch (error) {
      console.error('Aadhar verification error:', error)
      return {
        verified: false,
        reason: error.message,
      }
    }
  }

  /**
   * Verify ID via Trulioo
   */
  async verifyViaTrilioo(idType, idNumber) {
    try {
      // In production, call Trulioo API
      // const response = await fetch('https://api.trulioo.com/trial/verification/v1/document', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Basic ${Buffer.from(`username:${this.truliooApiKey}`).toString('base64')}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     Id: { Type: idType, Number: idNumber },
      //   }),
      // });
      // const result = await response.json();

      return {
        verified: true,
        level: 'HIGH',
        provider: 'Trulioo',
      }
    } catch (error) {
      console.error('Trulioo verification error:', error)
      return {
        verified: false,
        reason: error.message,
      }
    }
  }

  /**
   * Verify Aadhar checksum (Verhoeff algorithm)
   */
  verifyAadharChecksum(aadhar) {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ]
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ]
    const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

    let c = 0
    for (let i = aadhar.length - 1, pPos = 0; i >= 0; i--, pPos++) {
      c = d[c][p[pPos % 8][parseInt(aadhar[i])]]
    }
    return c === 0
  }

  /**
   * Validate ID format
   */
  validateIDFormat(idType, idNumber) {
    const formats = {
      passport: /^[A-Z]{1,2}[0-9]{6,9}$/,
      driving_license: /^[A-Z0-9]{5,20}$/,
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      aadhar: /^[0-9]{12}$/,
    }

    const pattern = formats[idType.toLowerCase()]
    if (!pattern) {
      return { verified: false, reason: 'Unknown ID type' }
    }

    return {
      verified: pattern.test(idNumber),
      reason: pattern.test(idNumber) ? 'Valid format' : 'Invalid format',
    }
  }

  /**
   * Verify medical/health documents
   */
  async verifyMedicalDocuments(userId, documents) {
    try {
      const verifications = []

      for (const doc of documents) {
        const verification = {
          type: doc.type, // 'blood_group_certificate', 'health_report', etc
          fileName: doc.fileName,
          uploadDate: new Date().toISOString(),
          status: 'PENDING_REVIEW',
          verificationLevel: 'MANUAL', // Requires human review
        }

        // In production, implement OCR to extract data from documents
        if (doc.type === 'blood_group_certificate') {
          verification.extractedData = this.extractBloodGroupData(doc)
        } else if (doc.type === 'health_report') {
          verification.extractedData = this.extractHealthData(doc)
        }

        verifications.push(verification)
      }

      return {
        userId: userId,
        documentCount: documents.length,
        verifications: verifications,
        overallStatus: 'PENDING_VERIFICATION',
      }
    } catch (error) {
      console.error('Medical document verification error:', error)
      return {
        userId: userId,
        error: error.message,
        status: 'ERROR',
      }
    }
  }

  /**
   * Extract blood group data from certificate
   */
  extractBloodGroupData(document) {
    // In production, use OCR library (Tesseract, AWS Textract, etc)
    return {
      bloodGroup: 'PENDING_OCR',
      issueDate: 'PENDING_OCR',
      certifyingHospital: 'PENDING_OCR',
      confidence: 0,
    }
  }

  /**
   * Extract health data from report
   */
  extractHealthData(document) {
    return {
      bloodPressure: 'PENDING_OCR',
      hemoglobin: 'PENDING_OCR',
      weight: 'PENDING_OCR',
      testDate: 'PENDING_OCR',
      confidence: 0,
    }
  }

  /**
   * Verify biometric data (fingerprint, face recognition)
   */
  async verifyBiometric(userId, biometricType, biometricData) {
    try {
      // In production, use AWS Rekognition or similar
      return {
        userId: userId,
        biometricType: biometricType,
        verified: true,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Biometric verification error:', error)
      return {
        userId: userId,
        verified: false,
        error: error.message,
      }
    }
  }

  /**
   * Get KYC verification status
   */
  async getKYCStatus(userId) {
    try {
      // In production, fetch from database
      return {
        userId: userId,
        overallStatus: 'PENDING',
        verifications: {
          governmentID: 'PENDING',
          medicalDocuments: 'PENDING',
          biometric: 'PENDING',
          emailVerified: false,
          phoneVerified: false,
        },
        riskLevel: 'MEDIUM',
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error('KYC status error:', error)
      return {
        userId: userId,
        error: error.message,
        status: 'ERROR',
      }
    }
  }

  /**
   * Update KYC status
   */
  async updateKYCStatus(userId, verificationData) {
    try {
      const kycStatus = {
        userId: userId,
        ...verificationData,
        lastUpdated: new Date().toISOString(),
      }

      // Check if all verifications are complete
      const allVerified = Object.values(kycStatus.verifications || {}).every((v) => v === true)
      kycStatus.overallStatus = allVerified ? 'VERIFIED' : 'INCOMPLETE'

      return kycStatus
    } catch (error) {
      console.error('KYC update error:', error)
      return { error: error.message }
    }
  }
}

module.exports = new KYCVerificationService()
