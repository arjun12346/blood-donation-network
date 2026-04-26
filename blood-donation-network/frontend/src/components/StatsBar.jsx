// ============================================================
// StatsBar Component — Apple Design
// ============================================================
import { AlertTriangle, CheckCircle2, Droplets, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function StatsBar() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/requests/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  const items = [
    { label: 'Active', value: stats?.active ?? '—', icon: Droplets, color: 'text-rose-600' },
    {
      label: 'High Priority',
      value: stats?.highPriority ?? '—',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    {
      label: 'Fulfilled',
      value: stats?.fulfilled ?? '—',
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    { label: 'Donors', value: stats?.donors ?? '—', icon: Users, color: 'text-sky-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-4 flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-lg font-semibold ${color}`}>{value}</div>
            <div className="text-[11px] text-gray-400 font-medium">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
