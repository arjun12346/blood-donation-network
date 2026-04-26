// ============================================================
// Home Page - Hero Section + Features
// ============================================================
import {
  Activity,
  ArrowRight,
  Bell,
  ClipboardCheck,
  Droplets,
  FileText,
  MapPin,
  Phone,
  Shield,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatsBar from '../components/StatsBar'
import { useAuth } from '../context/AuthContext'

const Feature = ({ Icon, title, desc, color }) => (
  <div className="card p-6 transition-all duration-200 group">
    <div
      className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
)

const BloodGroupBadge = ({ group }) => {
  const colors = {
    'O+': 'bg-rose-500',
    'O-': 'bg-rose-600',
    'A+': 'bg-sky-500',
    'A-': 'bg-sky-600',
    'B+': 'bg-emerald-500',
    'B-': 'bg-emerald-600',
    'AB+': 'bg-violet-500',
    'AB-': 'bg-violet-600',
  }
  return (
    <span
      className={`${colors[group] || 'bg-gray-500'} text-white font-semibold px-3 py-1.5 rounded-lg text-sm`}
    >
      {group}
    </span>
  )
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-in">
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-slide-up">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              AI-Powered Emergency Network
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-slide-up">
              Every Drop of Blood
              <span className="block text-rose-200">Saves a Life</span>
            </h1>

            <p className="text-lg sm:text-xl text-rose-100 mb-8 leading-relaxed max-w-2xl animate-slide-up">
              Connect with verified blood donors instantly during emergencies. Our AI detects
              urgency, prevents fraud, and matches you with the right donors — fast.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="bg-white text-rose-700 hover:bg-rose-50 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                  {user.role === 'receiver' && (
                    <Link
                      to="/dashboard"
                      className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 backdrop-blur-sm inline-flex items-center gap-2"
                    >
                      <Droplets className="w-4 h-4" /> Emergency Request
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-rose-700 hover:bg-rose-50 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2"
                  >
                    <Droplets className="w-4 h-4" /> Register as Donor
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 backdrop-blur-sm inline-flex items-center gap-2"
                  >
                    Find Blood Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Blood Group Chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((g) => (
                <BloodGroupBadge key={g} group={g} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full fill-gray-50 dark:fill-gray-950"
          >
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 py-10">
        <StatsBar />
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Why BloodNet?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Built for emergencies. Powered by AI. Trusted by communities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature
            Icon={Activity}
            title="AI Urgency Detection"
            color="bg-violet-500"
            desc="Our AI analyzes request messages and classifies urgency as HIGH, MEDIUM, or LOW — so the most critical cases get attention first."
          />
          <Feature
            Icon={Shield}
            title="Fake Request Detection"
            color="bg-amber-500"
            desc="Advanced spam detection flags suspicious requests. Phone numbers are hidden for high-risk requests to protect donors."
          />
          <Feature
            Icon={Star}
            title="Donor Trust Score"
            color="bg-emerald-500"
            desc="Verified donors earn trust points with each successful donation. Trust badges help receivers identify reliable donors."
          />
          <Feature
            Icon={MapPin}
            title="Nearest Hospital"
            color="bg-sky-500"
            desc="Each request shows the nearest hospital automatically, so donors know exactly where to go without any extra steps."
          />
          <Feature
            Icon={Phone}
            title="One-Tap Call"
            color="bg-rose-500"
            desc="Direct call button on every request card. No middlemen, no delays — connect directly with the person in need."
          />
          <Feature
            Icon={Bell}
            title="Real-Time Notifications"
            color="bg-orange-500"
            desc="Donors get notified instantly when a matching blood group request is posted nearby. Zero delays in emergencies."
          />
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="bg-gray-900 dark:bg-gray-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
          <p className="text-gray-400 mb-10 text-sm">Simple. Fast. Life-saving.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                Icon: FileText,
                title: 'Post Request',
                desc: 'Receiver submits blood request with details. AI instantly analyzes urgency and risk.',
              },
              {
                step: '02',
                Icon: Bell,
                title: 'Donors Notified',
                desc: 'Matching blood group donors are notified immediately with the request details.',
              },
              {
                step: '03',
                Icon: ClipboardCheck,
                title: 'Blood Donated',
                desc: 'Donor connects directly via one-tap call. Life saved, donor earns trust points.',
              },
            ].map(({ step, Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-5xl font-bold text-rose-900/40 mb-3">{step}</div>
                <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          {!user && (
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
              >
                Join as Donor <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200"
              >
                View Requests
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 text-center">
        <p className="text-gray-400 text-sm">
          <strong className="text-rose-600">BloodNet</strong> — AI-Powered Emergency Blood Donation
          Network
        </p>
      </footer>
    </div>
  )
}
