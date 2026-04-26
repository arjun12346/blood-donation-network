// ============================================================
// Navbar Component — Apple Design
// ============================================================
import {
  Bell,
  ChevronDown,
  Droplets,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const BloodDropIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
  </svg>
)

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donors', label: 'Donors', icon: Users },
    ...(user ? [{ to: '/my-requests', label: 'My Requests', icon: Droplets }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <BloodDropIcon />
            <span className="font-semibold text-base tracking-tight text-gray-900 dark:text-white">
              BloodNet
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
              title="Toggle appearance"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 py-2 animate-scale-in">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              user.role === 'donor'
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400'
                                : 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400'
                            }`}
                          >
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              user.trustScore === 'trusted'
                                ? 'bg-emerald-50 text-emerald-700'
                                : user.trustScore === 'moderate'
                                  ? 'bg-amber-50 text-amber-700'
                                  : user.trustScore === 'risk'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {user.trustScore === 'trusted'
                              ? 'Trusted'
                              : user.trustScore === 'moderate'
                                ? 'Moderate'
                                : user.trustScore === 'risk'
                                  ? 'Risk'
                                  : 'New'}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        to="/my-requests"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Droplets className="w-4 h-4" /> My Requests
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Join
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-0.5 animate-slide-up">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${isActive(to) ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            {!user ? (
              <div className="flex gap-2 pt-2 px-2">
                <Link to="/login" className="btn-secondary text-sm py-2 flex-1 text-center">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 flex-1 text-center">
                  Join
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 font-medium flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
