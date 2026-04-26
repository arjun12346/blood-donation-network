import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken')
        const savedUser = await AsyncStorage.getItem('userData')

        if (savedToken) {
          setToken(savedToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (e) {
        console.error('Failed to restore session', e)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData)

      await AsyncStorage.setItem('userToken', data.token)
      await AsyncStorage.setItem('userData', JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })

      await AsyncStorage.setItem('userToken', data.token)
      await AsyncStorage.setItem('userData', JSON.stringify(data.user))

      setToken(data.token)
      setUser(data.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken')
      await AsyncStorage.removeItem('userData')

      setToken(null)
      setUser(null)
      delete api.defaults.headers.common['Authorization']
    } catch (error) {
      console.error('Failed to logout', error)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    AsyncStorage.setItem('userData', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    isSignedIn: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
