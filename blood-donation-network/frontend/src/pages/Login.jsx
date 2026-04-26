// ============================================================
// Login Page — Apple Design
// ============================================================
import {
  ArrowRight,
  Award,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Stethoscope,
  User,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email) => setForm({ email, password: 'demo1234' })

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to BloodNet</p>
          </div>

          {/* Demo Accounts */}
          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-xl p-3 mb-6">
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-2 flex items-center gap-1">
              <Award className="w-3 h-3" /> Demo Accounts (click to fill)
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => fillDemo('ravi@demo.com')}
                className="text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-sky-400 px-3 py-1.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
              >
                <User className="w-3 h-3" /> Donor (Ravi)
              </button>
              <button
                onClick={() => fillDemo('amit@demo.com')}
                className="text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-sky-400 px-3 py-1.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
              >
                <Stethoscope className="w-3 h-3" /> Receiver (Amit)
              </button>
              <button
                onClick={() => fillDemo('deepak@demo.com')}
                className="text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-sky-400 px-3 py-1.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
              >
                <Award className="w-3 h-3" /> Trusted (Deepak)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
            >
              Join BloodNet
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
