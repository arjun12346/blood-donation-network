// ============================================================
// Profile Page — Apple Design
// ============================================================
import {
  Award,
  Calendar,
  CheckCircle,
  Droplets,
  Flag,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import OTPVerification from '../components/OTPVerification'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TRUST_CONFIG = {
  trusted: {
    label: 'Trusted',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
    desc: 'You are a highly trusted member of the community.',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-amber-600',
    bg: 'bg-amber-500',
    desc: 'Complete a donation to increase your trust score.',
  },
  new: {
    label: 'New User',
    color: 'text-gray-500',
    bg: 'bg-gray-400',
    desc: 'Verify your phone and complete a donation to build trust.',
  },
  risk: {
    label: 'Risk',
    color: 'text-rose-600',
    bg: 'bg-rose-500',
    desc: 'Your account has been flagged. Contact support.',
  },
}

export default function Profile() {
  const { user, updateUser, fetchNotifications, notifications } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [donationLoading, setDonationLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    locationText: user?.location?.text || '',
  })
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const trust = TRUST_CONFIG[user?.trustScore] || TRUST_CONFIG.new
  const trustPercent = Math.min(100, ((user?.trustPoints || 0) / 100) * 100)

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        location: { text: form.locationText },
      })
      updateUser(data.user)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDonation = async () => {
    setDonationLoading(true)
    try {
      const { data } = await api.post('/auth/donation-success')
      updateUser({
        ...user,
        trustScore: data.trustScore,
        trustPoints: data.trustPoints,
        successfulDonations: data.successfulDonations,
      })
      toast.success('Donation recorded! Trust score updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setDonationLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/auth/notifications/read')
      fetchNotifications()
      toast.success('All notifications marked as read')
    } catch {}
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h1>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-semibold ${trust.color}`}>{trust.label}</span>
              <span className="text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-lg">
                {user?.bloodGroup}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user?.role === 'donor' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}
              >
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Score Bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Trust Score
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {user?.trustPoints || 0} / 100 pts
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${trust.bg} rounded-full transition-all duration-700`}
              style={{ width: `${trustPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{trust.desc}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Donations', value: user?.successfulDonations || 0, Icon: Droplets },
            { label: 'Trust Pts', value: user?.trustPoints || 0, Icon: Award },
            { label: 'Reports', value: user?.reportCount || 0, Icon: Flag },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {[
          { key: 'profile', label: 'Profile', Icon: User },
          {
            key: 'notifications',
            label: `Notifications ${unread > 0 ? `(${unread})` : ''}`,
            Icon: Award,
          },
          { key: 'actions', label: 'Actions', Icon: CheckCircle },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Profile Details</h2>
            <button
              onClick={() => {
                setEditing(!editing)
                if (editing)
                  setForm({
                    name: user?.name,
                    phone: user?.phone,
                    locationText: user?.location?.text || '',
                  })
              }}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!user?.isVerified && (
            <div className="mb-4">
              <OTPVerification />
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <input
                  value={form.locationText}
                  onChange={(e) => setForm((p) => ({ ...p, locationText: e.target.value }))}
                  placeholder="City, Area"
                  className="input-field"
                />
              </div>
              <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Email', value: user?.email, Icon: Mail },
                { label: 'Phone', value: user?.phone, Icon: Phone },
                { label: 'Blood Group', value: user?.bloodGroup, Icon: Droplets },
                {
                  label: 'Role',
                  value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1),
                  Icon: User,
                },
                { label: 'Location', value: user?.location?.text || 'Not set', Icon: MapPin },
                {
                  label: 'Member Since',
                  value: new Date(user?.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                  Icon: Calendar,
                },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {value || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h2>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <Award className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 20).map((n, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${n.read ? 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900' : 'border-rose-100 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'}`}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Actions */}
      {activeTab === 'actions' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
            Quick Actions
          </h2>

          {user?.role === 'donor' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Droplets className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    Record a Donation
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">
                    Earn +20 trust points for each donation
                  </p>
                </div>
              </div>
              <button
                onClick={handleMarkDonation}
                disabled={donationLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95"
              >
                {donationLoading ? 'Recording...' : 'Mark Donation Complete'}
              </button>
            </div>
          )}

          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="font-semibold text-sky-800 dark:text-sky-300 text-sm">
                  How to Earn Trust Points
                </h3>
                <p className="text-xs text-sky-600 dark:text-sky-500">
                  Build your reputation in the community
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-sky-700 dark:text-sky-400">
              {[
                { action: 'Verify phone number', pts: '+10 pts' },
                { action: 'Complete a donation', pts: '+20 pts' },
                { action: 'Respond to a request', pts: '+5 pts' },
                { action: 'Get reported', pts: '-10 pts' },
              ].map(({ action, pts }) => (
                <li key={action} className="flex items-center justify-between text-xs">
                  <span>{action}</span>
                  <span
                    className={`font-semibold ${pts.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {pts}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1">Trust Score Levels:</p>
            <ul className="space-y-0.5">
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                <strong>Trusted</strong> — 30+ points
              </li>
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />
                <strong>Moderate</strong> — 10–29 points
              </li>
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1" />
                <strong>New User</strong> — 0–9 points
              </li>
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" />
                <strong>Risk</strong> — 3+ reports
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
