// ============================================================
// My Requests Page — Apple Design
// ============================================================
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle,
  ClipboardList,
  Droplets,
  MapPin,
  Plus,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CreateRequestModal from '../components/CreateRequestModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  fulfilled: {
    label: 'Fulfilled',
    class: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
  },
  expired: {
    label: 'Expired',
    class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  flagged: {
    label: 'Flagged',
    class: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  },
}

const PRIORITY_BADGE = {
  HIGH: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  LOW: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
}

const RISK_CONFIG = {
  SAFE: { label: 'Safe', Icon: ShieldCheck, color: 'text-emerald-500' },
  MEDIUM: { label: 'Medium', Icon: AlertCircle, color: 'text-amber-500' },
  HIGH: { label: 'High Risk', Icon: AlertTriangle, color: 'text-rose-500' },
}

export default function MyRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchMyRequests = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/requests/my')
      setRequests(data.requests || [])
    } catch {
      toast.error('Failed to load your requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const handleFulfill = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/requests/${id}/fulfill`)
      toast.success('Marked as fulfilled!')
      fetchMyRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this request?')) return
    setActionLoading(id)
    try {
      await api.put(`/requests/${id}`, { status: 'expired' })
      toast.success('Request cancelled.')
      fetchMyRequests()
    } catch {
      toast.error('Failed to cancel')
    } finally {
      setActionLoading(null)
    }
  }

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Blood Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {requests.length} total · {requests.filter((r) => r.status === 'active').length} active
          </p>
        </div>
        {user?.role === 'receiver' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your requests..." />
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No requests yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {user?.role === 'receiver'
              ? "You haven't posted any blood requests yet."
              : "You're a donor — check the dashboard to respond to requests."}
          </p>
          {user?.role === 'receiver' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Post Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.active
            const priorityClass = PRIORITY_BADGE[req.priorityLevel] || PRIORITY_BADGE.LOW
            const risk = RISK_CONFIG[req.riskLevel] || RISK_CONFIG.SAFE
            const RiskIcon = risk.Icon
            return (
              <div key={req._id} className="card p-5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-rose-500 text-white font-bold text-base rounded-xl flex items-center justify-center">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.class}`}
                        >
                          {status.label}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityClass}`}
                        >
                          {req.priorityLevel}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <RiskIcon className={`w-3 h-3 ${risk.color}`} /> {risk.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(req.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {req.respondedDonors?.length || 0} responses
                    </p>
                    {req.respondedDonors?.length > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center justify-end gap-1">
                        <Droplets className="w-3 h-3" /> Donors responded!
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                  {req.message}
                </p>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {req.location?.text}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      {req.nearestHospital?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-purple-400" />
                      {req.unitsNeeded} unit(s)
                    </span>
                  </div>

                  {req.status === 'active' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFulfill(req._id)}
                        disabled={actionLoading === req._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Fulfilled
                      </button>
                      <button
                        onClick={() => handleDelete(req._id)}
                        disabled={actionLoading === req._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-gray-500 hover:text-rose-600 transition-all active:scale-95 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <CreateRequestModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            fetchMyRequests()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
