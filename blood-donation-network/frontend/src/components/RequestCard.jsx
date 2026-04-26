// ============================================================
// RequestCard Component — Apple Design
// ============================================================
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  Flag,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', class: 'badge-high', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  MEDIUM: { label: 'Medium', class: 'badge-medium', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  LOW: { label: 'Low', class: 'badge-safe', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
}

const TRUST_CONFIG = {
  trusted: { label: 'Trusted', class: 'badge-safe' },
  moderate: { label: 'Moderate', class: 'badge-medium' },
  new: { label: 'New', class: 'badge-new' },
  risk: { label: 'Risk', class: 'badge-high' },
}

const RISK_CONFIG = {
  SAFE: { label: 'Safe', class: 'badge-safe' },
  MEDIUM: { label: 'Medium Risk', class: 'badge-medium' },
  HIGH: { label: 'High Risk', class: 'badge-high' },
}

const BLOOD_GROUP_COLORS = {
  'A+': 'bg-rose-500',
  'A-': 'bg-rose-600',
  'B+': 'bg-sky-500',
  'B-': 'bg-sky-600',
  'AB+': 'bg-violet-500',
  'AB-': 'bg-violet-600',
  'O+': 'bg-orange-500',
  'O-': 'bg-orange-600',
}

export default function RequestCard({ request, onUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reported, setReported] = useState(false)
  const [responded, setResponded] = useState(false)

  const priority = PRIORITY_CONFIG[request.priorityLevel] || PRIORITY_CONFIG.LOW
  const trust = TRUST_CONFIG[request.trustScore] || TRUST_CONFIG.new
  const risk = RISK_CONFIG[request.riskLevel] || RISK_CONFIG.SAFE
  const bloodColor = BLOOD_GROUP_COLORS[request.bloodGroup] || 'bg-rose-500'

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return minutes + 'm ago'
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return hours + 'h ago'
    return Math.floor(hours / 24) + 'd ago'
  }

  const handleReport = async () => {
    if (!user) return toast.error('Please sign in to report')
    if (reported) return
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/report`, { reason: 'Suspicious activity' })
      toast.success('Report submitted')
      setReported(true)
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Report failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!user) return toast.error('Please sign in to respond')
    if (responded) return
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/respond`)
      toast.success('Response recorded')
      setResponded(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond')
    } finally {
      setLoading(false)
    }
  }

  const handleFulfill = async () => {
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/fulfill`)
      toast.success('Marked as fulfilled')
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = user && request.requester?._id?.toString() === user._id?.toString()
  const phoneHidden = request.riskLevel === 'HIGH' && !isOwner

  return (
    <div className={`card overflow-hidden animate-fade-in ${priority.bg}`}>
      {request.priorityLevel === 'HIGH' && <div className="h-0.5 w-full bg-rose-500" />}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`${bloodColor} text-white font-bold text-base w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              {request.bloodGroup}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {request.name}
                </h3>
                {request.requester?.isVerified && (
                  <Shield className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={priority.class}>{priority.label}</span>
                <span className={trust.class}>{trust.label}</span>
                <span className={risk.class}>{risk.label}</span>
              </div>
            </div>
          </div>

          <span className="text-[11px] text-gray-400 flex-shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(request.createdAt)}
          </span>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
          {request.message}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{request.location?.text}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {request.nearestHospital?.name}{' '}
              <span className="text-emerald-600 font-medium">
                {request.nearestHospital?.distance}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Droplets className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{request.unitsNeeded || 1} unit(s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{request.patientName || request.name}</span>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white/70 dark:bg-gray-800/40 rounded-xl p-3 mb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> AI Analysis
          </p>
          <span className="text-[11px] bg-white dark:bg-gray-900 rounded-lg px-2 py-1 border dark:border-gray-700 text-gray-500 dark:text-gray-400 inline-block">
            Priority:{' '}
            <strong className="text-gray-700 dark:text-gray-300">
              {request.priorityReason?.split(';')[0]?.slice(0, 40)}
            </strong>
          </span>
          {request.riskReason && request.riskReason !== 'No suspicious patterns detected' && (
            <p className="text-[11px] text-gray-400 mt-1">
              {request.riskReason?.split(';')[0]?.slice(0, 60)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {phoneHidden ? (
            <div className="inline-flex items-center gap-1.5 text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
              <Phone className="w-3.5 h-3.5" /> Hidden
            </div>
          ) : (
            <a
              href={`tel:${request.phone}`}
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors active:scale-[0.97]"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}

          <div className="flex gap-2">
            {user && user.role === 'donor' && !isOwner && (
              <button
                onClick={handleRespond}
                disabled={loading || responded}
                className={`text-xs font-medium px-3 py-2 rounded-full transition-all active:scale-[0.97] ${responded ? 'bg-sky-50 text-sky-600 cursor-default' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
              >
                {responded ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Responded
                  </span>
                ) : (
                  'Respond'
                )}
              </button>
            )}

            {isOwner && request.status === 'active' && (
              <button
                onClick={handleFulfill}
                disabled={loading}
                className="text-xs font-medium px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors active:scale-[0.97]"
              >
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fulfilled
                </span>
              </button>
            )}

            {!isOwner && (
              <button
                onClick={handleReport}
                disabled={loading || reported}
                className={`text-xs font-medium px-3 py-2 rounded-full transition-all active:scale-[0.97] ${reported ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-500 hover:text-rose-600'}`}
              >
                {reported ? (
                  'Reported'
                ) : (
                  <span className="flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Report
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {request.respondedDonors?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {request.respondedDonors.length} donor(s)
              responded
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
