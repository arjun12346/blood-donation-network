// ============================================================
// Region/Country Service - Global Support
// ============================================================

class RegionService {
  constructor() {
    this.supportedCountries = (
      process.env.SUPPORTED_COUNTRIES || 'US,UK,India,Canada,Australia'
    ).split(',')
    this.countryConfig = this.initializeCountryConfig()
  }

  /**
   * Initialize country-specific configurations
   */
  initializeCountryConfig() {
    return {
      US: {
        name: 'United States',
        code: 'US',
        timezone: 'America/New_York',
        currency: 'USD',
        dialCode: '+1',
        bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        donationIntervalDays: 56,
        minAge: 18,
        maxAge: 65,
        minWeight: 50,
        emergencyServices: ['911'],
        majorBloodBanks: ['Red Cross', 'OneBlood', 'BloodCare'],
        regulations: 'FDA',
      },
      UK: {
        name: 'United Kingdom',
        code: 'UK',
        timezone: 'Europe/London',
        currency: 'GBP',
        dialCode: '+44',
        bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        donationIntervalDays: 56,
        minAge: 17,
        maxAge: 66,
        minWeight: 50,
        emergencyServices: ['999'],
        majorBloodBanks: ['NHS Blood Donation', 'Scottish National Blood Transfusion'],
        regulations: 'MHRA',
      },
      INDIA: {
        name: 'India',
        code: 'IN',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        dialCode: '+91',
        bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        donationIntervalDays: 56,
        minAge: 18,
        maxAge: 65,
        minWeight: 45,
        emergencyServices: ['102', '108'],
        majorBloodBanks: ['NBTC', 'Indian Red Cross', 'State Blood Banks'],
        regulations: 'AABB, WHO',
      },
      CANADA: {
        name: 'Canada',
        code: 'CA',
        timezone: 'America/Toronto',
        currency: 'CAD',
        dialCode: '+1',
        bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        donationIntervalDays: 56,
        minAge: 17,
        maxAge: 76,
        minWeight: 50,
        emergencyServices: ['911'],
        majorBloodBanks: ['Canadian Blood Services', 'Héma-Québec'],
        regulations: 'Health Canada',
      },
      AUSTRALIA: {
        name: 'Australia',
        code: 'AU',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        dialCode: '+61',
        bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        donationIntervalDays: 56,
        minAge: 18,
        maxAge: 71,
        minWeight: 50,
        emergencyServices: ['000'],
        majorBloodBanks: ['Australian Red Cross Blood Service'],
        regulations: 'TGA',
      },
    }
  }

  /**
   * Get country configuration
   */
  getCountryConfig(countryCode) {
    const config = this.countryConfig[countryCode.toUpperCase()]
    if (!config) {
      throw new Error(`Country ${countryCode} not supported`)
    }
    return config
  }

  /**
   * Format phone number for region
   */
  formatPhoneNumber(phoneNumber, countryCode) {
    const config = this.getCountryConfig(countryCode)
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '')

    // Add country code if not present
    if (!cleaned.startsWith(config.dialCode.replace('+', ''))) {
      return config.dialCode + cleaned
    }
    return '+' + cleaned
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber, countryCode) {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber, countryCode)
      // Basic validation: should be 10-15 digits
      const digits = formatted.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    } catch {
      return false
    }
  }

  /**
   * Get blood bank list for region
   */
  getBloodBanks(countryCode) {
    const config = this.getCountryConfig(countryCode)
    return {
      country: config.name,
      banks: config.majorBloodBanks,
      regulations: config.regulations,
    }
  }

  /**
   * Get emergency services for region
   */
  getEmergencyServices(countryCode) {
    const config = this.getCountryConfig(countryCode)
    return {
      country: config.name,
      emergencyNumbers: config.emergencyServices,
    }
  }

  /**
   * Get donation eligibility criteria
   */
  getDonationCriteria(countryCode) {
    const config = this.getCountryConfig(countryCode)
    return {
      minAge: config.minAge,
      maxAge: config.maxAge,
      minWeight: `${config.minWeight}kg`,
      intervalBetweenDonations: `${config.donationIntervalDays} days`,
      bloodGroups: config.bloodGroups,
    }
  }

  /**
   * Check if country is supported
   */
  isSupportedCountry(countryCode) {
    return Object.keys(this.countryConfig).includes(countryCode.toUpperCase())
  }

  /**
   * Get list of supported countries
   */
  getSupportedCountries() {
    return Object.values(this.countryConfig).map((config) => ({
      code: config.code,
      name: config.name,
      dialCode: config.dialCode,
      timezone: config.timezone,
      currency: config.currency,
    }))
  }

  /**
   * Convert currency
   */
  async convertCurrency(amount, fromCountry, toCountry) {
    try {
      const fromConfig = this.getCountryConfig(fromCountry)
      const toConfig = this.getCountryConfig(toCountry)

      // In production, call a currency conversion API
      // For now, return placeholder
      return {
        originalAmount: amount,
        originalCurrency: fromConfig.currency,
        targetCurrency: toConfig.currency,
        convertedAmount: amount, // Should call real API
        rate: 1.0,
      }
    } catch (error) {
      throw new Error(`Currency conversion failed: ${error.message}`)
    }
  }

  /**
   * Get time in specific timezone
   */
  getTimeInTimezone(countryCode) {
    const config = this.getCountryConfig(countryCode)
    // In production, use proper timezone library
    return {
      country: config.name,
      timezone: config.timezone,
      currentTime: new Date().toISOString(),
    }
  }
}

module.exports = new RegionService()
