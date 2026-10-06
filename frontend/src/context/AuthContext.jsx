import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hospital_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('hospital_token'))
  const [loading, setLoading] = useState(true)

  // Verify token on initial application mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('hospital_token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user)
          localStorage.setItem('hospital_user', JSON.stringify(response.data.user))
        }
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem('hospital_token')
        localStorage.removeItem('hospital_user')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = response.data

    localStorage.setItem('hospital_token', newToken)
    localStorage.setItem('hospital_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)

    return newUser
  }

  const logout = () => {
    localStorage.removeItem('hospital_token')
    localStorage.removeItem('hospital_user')
    setUser(null)
    setToken(null)
  }

  const hasRole = (...allowedRoles) => {
    if (!user || !user.role) return false
    return allowedRoles.includes(user.role)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    hasRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
