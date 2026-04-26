// ============================================================
// OTPVerification Component — Apple Design
// ============================================================
import { Loader2, ShieldCheck, Smartphone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function OTPVerification({ mockOtp, onVerified }) {
  const { updateUser } = useAuth()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { otp })
      updateUser(data.user)
      toast.success('Phone verified. Trust score updated.')
      onVerified?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const { data } = await api.post('/auth/resend-otp')
      toast.success(`New OTP sent. Demo: ${data.mockOtp}`)
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl p-5">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
            Verify Your Phone
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 mb-3">
            Enter the 6-digit OTP sent to your phone.
            {mockOtp && (
              <span className="font-bold block mt-1">
                Demo OTP:{' '}
                <span className="bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded font-mono text-lg">
                  {mockOtp}
                </span>
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="input-field text-center font-mono text-lg tracking-widest max-w-36"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="btn-primary text-sm px-4 flex items-center gap-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Verify
                </>
              )}
            </button>
            <button onClick={handleResend} className="btn-secondary text-xs px-3">
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
