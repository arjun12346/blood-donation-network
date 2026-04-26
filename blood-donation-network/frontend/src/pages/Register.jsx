// ============================================================
// Register Page — Apple Design
// ============================================================
import {
  ArrowLeft,
  ArrowRight,
  Droplets,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import OTPVerification from '../components/OTPVerification'
import { useAuth } from '../context/AuthContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COUNTRIES = [
  { code: 'US', name: 'United States', phone: '+1' },
  { code: 'GB', name: 'United Kingdom', phone: '+44' },
  { code: 'IN', name: 'India', phone: '+91' },
  { code: 'CA', name: 'Canada', phone: '+1' },
  { code: 'AU', name: 'Australia', phone: '+61' },
  { code: 'DE', name: 'Germany', phone: '+49' },
  { code: 'FR', name: 'France', phone: '+33' },
  { code: 'JP', name: 'Japan', phone: '+81' },
  { code: 'BR', name: 'Brazil', phone: '+55' },
  { code: 'MX', name: 'Mexico', phone: '+52' },
  { code: 'ZA', name: 'South Africa', phone: '+27' },
  { code: 'NG', name: 'Nigeria', phone: '+234' },
  { code: 'KE', name: 'Kenya', phone: '+254' },
  { code: 'PK', name: 'Pakistan', phone: '+92' },
  { code: 'BD', name: 'Bangladesh', phone: '+880' },
  { code: 'PH', name: 'Philippines', phone: '+63' },
  { code: 'ID', name: 'Indonesia', phone: '+62' },
  { code: 'SG', name: 'Singapore', phone: '+65' },
  { code: 'AE', name: 'UAE', phone: '+971' },
  { code: 'SA', name: 'Saudi Arabia', phone: '+966' },
]

const steps = ['Account Info', 'Personal Details', 'Verify OTP']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mockOtp, setMockOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    role: 'donor',
    locationText: '',
    country: COUNTRIES[2], // Default to India
  })

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const validateStep0 = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return (toast.error('Name must be at least 2 characters'), false)
    if (!form.email.includes('@')) return (toast.error('Enter a valid email'), false)
    if (form.password.length < 6)
      return (toast.error('Password must be at least 6 characters'), false)
    if (form.password !== form.confirmPassword)
      return (toast.error('Passwords do not match'), false)
    return true
  }

  const validateStep1 = () => {
    if (!form.phone || form.phone.length < 8)
      return (toast.error('Enter a valid phone number'), false)
    if (!form.bloodGroup) return (toast.error('Please select your blood group'), false)
    if (!form.country) return (toast.error('Please select your country'), false)
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    if (step === 1) handleRegister()
    else setStep((s) => s + 1)
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      const data = await register({
        name: form.name,
        email: form.email,
        phone: form.country.phone + ' ' + form.phone,
        password: form.password,
        bloodGroup: form.bloodGroup,
        role: form.role,
        location: { text: form.locationText, lat: null, lng: null },
        country: { code: form.country.code, name: form.country.name },
      })
      setMockOtp(data.mockOtp || '')
      setStep(2)
      toast.success('Account created! Verify your phone.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Join BloodNet</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save lives. Be a hero.</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-1 mb-6">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-1.5 ${i < step ? 'text-emerald-600' : i === step ? 'text-rose-600' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                  >
                    {i < step ? <ShieldCheck className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 rounded ${i < step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Account Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ravi Kumar"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ravi@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="input-field"
                />
              </div>
              <button
                onClick={handleNext}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Country *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="country"
                    value={form.country.code}
                    onChange={(e) => {
                      const selected = COUNTRIES.find((c) => c.code === e.target.value)
                      setForm((p) => ({ ...p, country: selected }))
                    }}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[80px] justify-center">
                    {form.country.phone}
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    className="input-field flex-1"
                    maxLength={15}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Blood Group *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, bloodGroup: g }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${form.bloodGroup === g ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-rose-300'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['donor', 'receiver'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, role: r }))}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2 ${form.role === r ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-rose-300'}`}
                    >
                      {r === 'donor' ? (
                        <>
                          <User className="w-4 h-4" /> Donor
                        </>
                      ) : (
                        <>
                          <Stethoscope className="w-4 h-4" /> Receiver
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Location (City/Area)
                </label>
                <input
                  name="locationText"
                  value={form.locationText}
                  onChange={handleChange}
                  placeholder="e.g. Connaught Place, New Delhi"
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <OTPVerification
                mockOtp={mockOtp}
                onVerified={() => setTimeout(() => navigate('/dashboard'), 1000)}
              />
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full text-sm py-2.5"
              >
                Skip for now (verify later)
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
