// ============================================================
// Dashboard Page - Main Blood Requests Feed
// ============================================================
import { AlertCircle, Droplets, Plus, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CreateRequestModal from '../components/CreateRequestModal'
import LoadingSpinner from '../components/LoadingSpinner'
import OTPVerification from '../components/OTPVerification'
import RequestCard from '../components/RequestCard'
import StatsBar from '../components/StatsBar'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const SORT_OPTIONS = [
  { value: 'priority', label: 'By Priority' },
  { value: 'trust', label: 'By Trust' },
  { value: 'newest', label: 'Newest First' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({ bloodGroup: 'All', sort: 'priority', search: '' })
  const [mockOtp, setMockOtp] = useState('')

  const fetchRequests = useCallback(async () => {
    try {
      const params = {
        sort: filters.sort,
        ...(filters.bloodGroup !== 'All' && { bloodGroup: filters.bloodGroup }),
        ...(filters.search && { location: filters.search }),
      }
      const { data } = await api.get('/requests', { params })
      setRequests(data.requests || [])
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Poll every 30s for real-time feel
  useEffect(() => {
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [fetchRequests])

  const highPriorityCount = requests.filter((r) => r.priorityLevel === 'HIGH').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* OTP Verification Banner */}
      {user && !user.isVerified && (
        <div className="mb-6">
          <OTPVerification mockOtp={mockOtp} onVerified={fetchRequests} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-rose-500" /> Blood Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading
              ? 'Loading...'
              : `${requests.length} active request${requests.length !== 1 ? 's' : ''}`}
            {highPriorityCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> {highPriorityCount} HIGH priority
              </span>
            )}
          </p>
        </div>
        {user?.role === 'receiver' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        )}
        {user?.role === 'donor' && (
          <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 dark:text-sky-400">
            <Droplets className="w-4 h-4" /> You're a donor — respond to requests below
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StatsBar />
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Search by location..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
          className="input-field py-2.5 text-sm w-full sm:w-44"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={() => {
            setLoading(true)
            fetchRequests()
          }}
          className="btn-secondary py-2.5 text-sm flex items-center gap-2 justify-center whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Blood Group Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {BLOOD_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setFilters((p) => ({ ...p, bloodGroup: g }))}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
              filters.bloodGroup === g
                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 bg-white dark:bg-gray-900'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <LoadingSpinner text="Loading blood requests..." />
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🩸</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            No requests found
          </h3>
          <p className="text-gray-400 text-sm">
            {filters.bloodGroup !== 'All' || filters.search
              ? 'Try changing filters or search terms'
              : 'No active blood requests right now'}
          </p>
          {filters.bloodGroup !== 'All' && (
            <button
              onClick={() => setFilters({ bloodGroup: 'All', sort: 'priority', search: '' })}
              className="btn-outline mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req} onUpdate={fetchRequests} />
          ))}
        </div>
      )}

      {/* Floating Create Button (mobile) */}
      {user?.role === 'receiver' && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center text-2xl transition-all duration-200 active:scale-90 z-40"
        >
          +
        </button>
      )}

      {/* Create Request Modal */}
      {showModal && (
        <CreateRequestModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            fetchRequests()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
