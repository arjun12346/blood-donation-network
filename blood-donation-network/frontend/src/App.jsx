// ============================================================
// App.jsx - Main Router
// ============================================================
import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingSpinner from './components/LoadingSpinner'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Donors from './pages/Donors'
import Home from './pages/Home'
import Login from './pages/Login'
import MyRequests from './pages/MyRequests'
import Profile from './pages/Profile'
import Register from './pages/Register'

// OAuth callback handler
const AuthSuccess = () => {
  const { updateUser } = useAuth()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userStr = params.get('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        localStorage.setItem('token', token)
        localStorage.setItem('user', userStr)
        updateUser(user)
        window.location.href = '/dashboard'
      } catch {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [updateUser])
  return <LoadingSpinner text="Signing you in..." />
}

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? children : <Navigate to="/login" replace />
}

// Guest-only route (redirect if already logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
