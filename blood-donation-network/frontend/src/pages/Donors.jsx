// ============================================================
// Donors Page — Apple Design
// ============================================================
import { Award, MapPin, Medal, Search, ShieldCheck, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const TRUST_CONFIG = {
  trusted: { label: 'Trusted', class: 'badge-safe', pts: 'bg-emerald-500' },
  moderate: { label: 'Moderate', class: 'badge-medium', pts: 'bg-amber-500' },
  new: { label: 'New User', class: 'badge-new', pts: 'bg-gray-400' },
  risk: { label: 'Risk', class: 'badge-high', pts: 'bg-rose-500' },
}

function DonorCard({ donor, rank }) {
  const trust = TRUST_CONFIG[donor.trustScore] || TRUST_CONFIG.new
  return (
    <div className="card p-5 transition-all duration-200">
      <div className="flex items-center gap-4">
        {rank !== undefined && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              rank === 0
                ? 'bg-amber-100 text-amber-700'
                : rank === 1
                  ? 'bg-gray-100 text-gray-600'
                  : rank === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
            }`}
          >
            {rank === 0 ? (
              <Trophy className="w-4 h-4" />
            ) : rank === 1 ? (
              <Medal className="w-4 h-4" />
            ) : rank === 2 ? (
              <Award className="w-4 h-4" />
            ) : (
              `#${rank + 1}`
            )}
          </div>
        )}

        <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {donor.name?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {donor.name}
            </span>
            {donor.isVerified && (
              <span className="text-sky-500 flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg">
              {donor.bloodGroup}
            </span>
            <span className={trust.class}>{trust.label}</span>
          </div>
          {donor.location?.text && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {donor.location.text}
            </p>
          )}
        </div>

        <div className="text-center flex-shrink-0">
          <div className="text-xl font-semibold text-rose-600">
            {donor.successfulDonations || 0}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">donations</div>
        </div>
      </div>

      {donor.trustPoints !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Trust Points</span>
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {donor.trustPoints || 0} pts
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${trust.pts} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, ((donor.trustPoints || 0) / 100) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Donors() {
  const [donors, setDonors] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [bloodGroup, setBloodGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true)
      try {
        const params = {
          ...(bloodGroup !== 'All' && { bloodGroup }),
          ...(search && { location: search }),
        }
        const [donorsRes, lbRes] = await Promise.all([
          api.get('/donors', { params }),
          api.get('/donors/leaderboard'),
        ])
        setDonors(donorsRes.data.donors || [])
        setLeaderboard(lbRes.data.leaderboard || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchDonors()
  }, [bloodGroup, search])

  const displayList = tab === 'leaderboard' ? leaderboard : donors

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-500" /> Donor Community
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {donors.length} verified donors ready to help
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Donors', Icon: Users },
          { key: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              tab === key
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-rose-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Filters (only for all tab) */}
      {tab === 'all' && (
        <>
          <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by location..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setBloodGroup(g)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  bloodGroup === g
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-rose-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Leaderboard Header */}
      {tab === 'leaderboard' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              Top Donors Leaderboard
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Ranked by successful donations and trust points
            </p>
          </div>
        </div>
      )}

      {/* Donor List */}
      {loading ? (
        <LoadingSpinner text="Loading donors..." />
      ) : displayList.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No donors found
          </h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayList.map((donor, i) => (
            <DonorCard key={donor._id} donor={donor} rank={tab === 'leaderboard' ? i : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}
