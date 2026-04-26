// ============================================================
// Seed Data - Demo Users and Blood Requests
// ============================================================
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')
const BloodRequest = require('../models/BloodRequest')

const demoUsers = [
  {
    name: 'Ravi Kumar',
    email: 'ravi@demo.com',
    phone: '9876543210',
    password: 'demo1234',
    bloodGroup: 'O+',
    role: 'donor',
    location: { text: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
    isVerified: true,
    otpVerified: true,
    trustScore: 'trusted',
    trustPoints: 60,
    successfulDonations: 3,
    dateOfBirth: new Date('1990-01-01'),
    country: { code: 'IN', name: 'India' },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    phone: '9876543211',
    password: 'demo1234',
    bloodGroup: 'B+',
    role: 'donor',
    location: { text: 'Lajpat Nagar, New Delhi', lat: 28.57, lng: 77.2378 },
    isVerified: true,
    otpVerified: true,
    trustScore: 'trusted',
    trustPoints: 45,
    successfulDonations: 2,
    dateOfBirth: new Date('1992-03-15'),
    country: { code: 'IN', name: 'India' },
  },
  {
    name: 'Amit Singh',
    email: 'amit@demo.com',
    phone: '9876543212',
    password: 'demo1234',
    bloodGroup: 'A+',
    role: 'receiver',
    location: { text: 'Sector 18, Noida', lat: 28.5706, lng: 77.3219 },
    isVerified: true,
    otpVerified: true,
    trustScore: 'moderate',
    trustPoints: 15,
    dateOfBirth: new Date('1988-07-20'),
    country: { code: 'IN', name: 'India' },
  },
  {
    name: 'Sunita Patel',
    email: 'sunita@demo.com',
    phone: '9876543213',
    password: 'demo1234',
    bloodGroup: 'AB+',
    role: 'receiver',
    location: { text: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
    isVerified: false,
    otpVerified: false,
    trustScore: 'new',
    trustPoints: 0,
    dateOfBirth: new Date('1995-11-10'),
    country: { code: 'IN', name: 'India' },
  },
  {
    name: 'Deepak Verma',
    email: 'deepak@demo.com',
    phone: '9876543214',
    password: 'demo1234',
    bloodGroup: 'O-',
    role: 'donor',
    location: { text: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
    isVerified: true,
    otpVerified: true,
    trustScore: 'trusted',
    trustPoints: 80,
    successfulDonations: 5,
    dateOfBirth: new Date('1985-05-05'),
    country: { code: 'IN', name: 'India' },
  },
  {
    name: 'Meera Nair',
    email: 'meera@demo.com',
    phone: '9876543215',
    password: 'demo1234',
    bloodGroup: 'B-',
    role: 'receiver',
    location: { text: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
    isVerified: true,
    otpVerified: true,
    trustScore: 'moderate',
    trustPoints: 20,
    dateOfBirth: new Date('1993-09-25'),
    country: { code: 'IN', name: 'India' },
  },
]

const demoRequests = [
  {
    name: 'Amit Singh',
    phone: '9876543212',
    bloodGroup: 'A+',
    message:
      'Patient met with a road accident and is in ICU. Immediate blood needed for emergency surgery. Please help urgently!',
    location: { text: 'AIIMS Hospital, New Delhi', lat: 28.5672, lng: 77.21 },
    priorityLevel: 'HIGH',
    priorityReason: 'ICU and accident keywords detected',
    riskLevel: 'SAFE',
    riskReason: 'Verified user, no spam detected',
    nearestHospital: { name: 'AIIMS Hospital', distance: '0.2 km' },
    trustScore: 'moderate',
    status: 'active',
    isActive: true,
    unitsNeeded: 3,
    patientName: 'Rakesh Singh',
  },
  {
    name: 'Sunita Patel',
    phone: '9876543213',
    bloodGroup: 'AB+',
    message:
      'My mother has been hospitalized for kidney failure surgery. She urgently needs blood. Please respond quickly.',
    location: { text: 'Lilavati Hospital, Mumbai', lat: 19.0596, lng: 72.8295 },
    priorityLevel: 'HIGH',
    priorityReason: 'Kidney failure and surgery keywords',
    riskLevel: 'MEDIUM',
    riskReason: 'New unverified user with urgent language',
    nearestHospital: { name: 'Lilavati Hospital', distance: '0.5 km' },
    trustScore: 'new',
    status: 'active',
    isActive: true,
    unitsNeeded: 2,
    patientName: 'Kamla Patel',
  },
  {
    name: 'Meera Nair',
    phone: '9876543215',
    bloodGroup: 'B-',
    message:
      'Patient is admitted in the hospital for a scheduled surgery tomorrow. B- blood needed today.',
    location: { text: 'Apollo Hospital, Chennai', lat: 13.0418, lng: 80.2341 },
    priorityLevel: 'MEDIUM',
    priorityReason: 'Hospitalized and today keywords',
    riskLevel: 'SAFE',
    riskReason: 'Moderate trust user, normal request',
    nearestHospital: { name: 'Apollo Hospital', distance: '1.1 km' },
    trustScore: 'moderate',
    status: 'active',
    isActive: true,
    unitsNeeded: 1,
    patientName: 'Suresh Nair',
  },
  {
    name: 'Rajesh Gupta',
    phone: '9123456789',
    bloodGroup: 'O+',
    message: 'Need O+ blood for a routine check-up next week. No emergency, just planned ahead.',
    location: { text: 'Fortis Hospital, Gurugram', lat: 28.4595, lng: 77.0266 },
    priorityLevel: 'LOW',
    priorityReason: 'Routine planned procedure',
    riskLevel: 'SAFE',
    riskReason: 'Regular language, no spam patterns',
    nearestHospital: { name: 'Fortis Hospital', distance: '0.8 km' },
    trustScore: 'new',
    status: 'active',
    isActive: true,
    unitsNeeded: 1,
    patientName: 'Rajesh Gupta',
  },
  {
    name: 'Anjali Reddy',
    phone: '9234567890',
    bloodGroup: 'AB-',
    message: 'URGENT URGENT!!! Need blood ASAP!!! pls fast pls fast!!!',
    location: { text: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    priorityLevel: 'HIGH',
    priorityReason: 'Urgent keyword detected',
    riskLevel: 'HIGH',
    riskReason: 'Spam-like repeated keywords; excessive exclamation marks',
    nearestHospital: { name: 'Yashoda Hospital', distance: '3.2 km' },
    trustScore: 'new',
    status: 'active',
    isActive: true,
    unitsNeeded: 2,
    patientName: 'Unknown',
  },
  {
    name: 'Vikram Mehta',
    phone: '9345678901',
    bloodGroup: 'A-',
    message:
      'Father suffered a severe stroke and heavy bleeding. He is in critical condition in the ICU. Doctors say A- blood is urgently needed for immediate surgery.',
    location: { text: 'Max Hospital, Saket, New Delhi', lat: 28.5244, lng: 77.2066 },
    priorityLevel: 'HIGH',
    priorityReason: 'Stroke, ICU, heavy bleeding, critical keywords',
    riskLevel: 'SAFE',
    riskReason: 'Detailed coherent message, no spam patterns',
    nearestHospital: { name: 'Max Super Specialty Hospital', distance: '0.3 km' },
    trustScore: 'new',
    status: 'active',
    isActive: true,
    unitsNeeded: 4,
    patientName: 'Mahesh Mehta',
  },
]

const seedData = async () => {
  try {
    const existingUsers = await User.countDocuments({
      email: { $in: demoUsers.map((u) => u.email) },
    })
    if (existingUsers > 0) {
      console.log('✅ Seed data already exists, skipping...')
      return
    }

    console.log('🌱 Seeding demo data...')

    // Create users
    const createdUsers = []
    for (const userData of demoUsers) {
      const user = new User(userData)
      user.updateTrustScore()
      await user.save()
      createdUsers.push(user)
    }

    // Map requests to user IDs
    const requestUserMap = {
      'Amit Singh': createdUsers.find((u) => u.name === 'Amit Singh')?._id,
      'Sunita Patel': createdUsers.find((u) => u.name === 'Sunita Patel')?._id,
      'Meera Nair': createdUsers.find((u) => u.name === 'Meera Nair')?._id,
    }

    // For demo requests without matching users, use first receiver
    const defaultRequesterId = createdUsers.find((u) => u.role === 'receiver')?._id

    for (const reqData of demoRequests) {
      const requesterId = requestUserMap[reqData.name] || defaultRequesterId
      await BloodRequest.create({ ...reqData, requester: requesterId })
    }

    console.log(`✅ Seeded ${createdUsers.length} users and ${demoRequests.length} blood requests`)
    console.log('📧 Demo login: ravi@demo.com / demo1234 (Donor)')
    console.log('📧 Demo login: amit@demo.com / demo1234 (Receiver)')
  } catch (error) {
    console.error('❌ Seed error:', error.message)
  }
}

// Run directly if called as script
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation')
    .then(async () => {
      await User.deleteMany({})
      await BloodRequest.deleteMany({})
      await seedData()
      mongoose.disconnect()
    })
}

module.exports = { seedData }
